package com.aazdoh.ai.service;

import com.aazdoh.ai.agent.AgentProgressListener;
import com.aazdoh.ai.agent.AgentTools;
import com.aazdoh.ai.dto.AgentActionReceipt;
import com.aazdoh.ai.dto.AgentChatMessageDto;
import com.aazdoh.ai.dto.AgentChatRequest;
import com.aazdoh.ai.dto.AgentChatResponse;
import com.aazdoh.ai.dto.AgentStreamEvent;
import com.aazdoh.ai.entity.AgentActionLog;
import com.aazdoh.ai.repository.AgentActionLogRepository;
import com.aazdoh.analytics.service.UserExecutionStatsService;
import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.entity.CommitmentPriority;
import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.common.exception.BadRequestException;
import com.aazdoh.common.exception.ResourceNotFoundException;
import com.aazdoh.user.entity.AiPersona;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.service.UserService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class AgentChatService {

    private static final Logger log = LoggerFactory.getLogger(AgentChatService.class);

    private final ChatClient chatClient;
    private final AgentTools agentTools;
    private final AgentActionLogRepository actionLogRepository;
    private final CommitmentRepository commitmentRepository;
    private final UserService userService;
    private final UserExecutionStatsService statsService;
    private final ObjectMapper objectMapper;

    @Value("${aazdoh.ai.enabled:true}")
    private boolean aiEnabled;

    @Value("classpath:/prompts/agent-system.st")
    private Resource agentSystemPrompt;

    public AgentChatService(
            ChatClient chatClient,
            AgentTools agentTools,
            AgentActionLogRepository actionLogRepository,
            CommitmentRepository commitmentRepository,
            UserService userService,
            UserExecutionStatsService statsService,
            ObjectMapper objectMapper
    ) {
        this.chatClient = chatClient;
        this.agentTools = agentTools;
        this.actionLogRepository = actionLogRepository;
        this.commitmentRepository = commitmentRepository;
        this.userService = userService;
        this.statsService = statsService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public AgentChatResponse chat(UUID userId, AgentChatRequest request) {
        User user = userService.findUserById(userId);
        AiPersona persona = user.getAiPersona() != null ? user.getAiPersona() : AiPersona.BALANCED;
        OffsetDateTime turnStart = OffsetDateTime.now();

        // 1. Inspect user's current context
        Map<String, Object> todayPlan = agentTools.getTodayPlan(userId);
        Map<String, Object> yesterdayPlan = agentTools.getPlanForDate(userId, LocalDate.now().minusDays(1));

        // 2. Build system prompt with persona
        String systemPromptText = buildSystemPrompt(persona, todayPlan, yesterdayPlan);

        String userMessage = request.getMessage().trim();
        String reply = null;

        try {
            if (aiEnabled && chatClient != null) {
                // Build standard Spring AI messages list
                List<Message> messages = new ArrayList<>();
                messages.add(new SystemMessage(systemPromptText));

                if (request.getHistory() != null && !request.getHistory().isEmpty()) {
                    for (AgentChatMessageDto turn : request.getHistory()) {
                        if ("user".equalsIgnoreCase(turn.getRole())) {
                            messages.add(new UserMessage(turn.getContent()));
                        } else if ("assistant".equalsIgnoreCase(turn.getRole())) {
                            messages.add(new AssistantMessage(turn.getContent()));
                        }
                    }
                }
                messages.add(new UserMessage(userMessage));

                // Call Spring AI ChatClient with native Function Calling tools
                AgentProgressListener.emit("🤖 Reasoning over execution options and cognitive constraints...");
                reply = chatClient.prompt()
                        .messages(messages)
                        .functions(
                                "createCommitmentFunction",
                                "getPlanFunction",
                                "postponeCommitmentFunction",
                                "completeCommitmentFunction",
                                "markCommitmentMissedFunction",
                                "deleteCommitmentFunction",
                                "stressTestScheduleFunction",
                                "detectExcuseFunction",
                                "generatePartnerBriefFunction",
                                "submitEveningReviewFunction"
                        )
                        .call()
                        .content();
            }
        } catch (Exception e) {
            log.warn("Spring AI native tool execution failed for user {}: {}", userId, e.getMessage());
        }

        // 3. Find any action logs created in this turn
        List<AgentActionLog> turnLogs = actionLogRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(l -> l.getCreatedAt().isAfter(turnStart.minusSeconds(2)))
                .collect(Collectors.toList());

        if (reply == null || reply.isBlank()) {
            if (!turnLogs.isEmpty()) {
                reply = "⚡ **Executed Actions:**\n" + turnLogs.stream()
                        .map(l -> "* " + l.getDescription())
                        .collect(Collectors.joining("\n"));
            } else {
                reply = handleHeuristicExecutionAndReply(user, todayPlan, yesterdayPlan, userMessage);
            }
        }

        List<AgentActionReceipt> receipts = turnLogs.stream().map(l -> new AgentActionReceipt(
                l.getId(),
                l.getActionType(),
                l.getDescription(),
                l.isUndone(),
                l.getCreatedAt()
        )).collect(Collectors.toList());

        // 4. Check for cognitive overload warning
        int totalMinutes = (int) todayPlan.getOrDefault("totalEstimatedMinutes", 0);
        String cognitiveWarning = null;
        if (totalMinutes > 360) {
            cognitiveWarning = "Warning: You have " + totalMinutes + " minutes scheduled today (> 6 hours). Consider pruning non-essential commitments.";
        }

        boolean undoAvailable = !receipts.isEmpty();

        return new AgentChatResponse(reply != null ? reply.trim() : "", receipts, undoAvailable, cognitiveWarning);
    }

    public SseEmitter chatStream(UUID userId, AgentChatRequest request) {
        SseEmitter emitter = new SseEmitter(120_000L);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        CompletableFuture.runAsync(() -> {
            SecurityContextHolder.getContext().setAuthentication(auth);
            try {
                AgentProgressListener.setListener(step -> {
                    try {
                        emitter.send(SseEmitter.event()
                                .name("STEP")
                                .data(AgentStreamEvent.step(step)));
                    } catch (Exception e) {
                        log.debug("SSE step emission failed: {}", e.getMessage());
                    }
                });

                User user = userService.findUserById(userId);
                AiPersona persona = user.getAiPersona() != null ? user.getAiPersona() : AiPersona.BALANCED;
                OffsetDateTime turnStart = OffsetDateTime.now();

                AgentProgressListener.emit("🔍 Inspecting active schedule & cognitive load...");

                // 1. Inspect user context
                Map<String, Object> todayPlan = agentTools.getTodayPlan(userId);
                Map<String, Object> yesterdayPlan = agentTools.getPlanForDate(userId, LocalDate.now().minusDays(1));

                // 2. Build system prompt
                String systemPromptText = buildSystemPrompt(persona, todayPlan, yesterdayPlan);
                String userMessage = request.getMessage().trim();
                StringBuilder replyBuffer = new StringBuilder();

                try {
                    if (aiEnabled && chatClient != null) {
                        List<Message> messages = new ArrayList<>();
                        messages.add(new SystemMessage(systemPromptText));
                        if (request.getHistory() != null && !request.getHistory().isEmpty()) {
                            for (AgentChatMessageDto turn : request.getHistory()) {
                                if ("user".equalsIgnoreCase(turn.getRole())) {
                                    messages.add(new UserMessage(turn.getContent()));
                                } else if ("assistant".equalsIgnoreCase(turn.getRole())) {
                                    messages.add(new AssistantMessage(turn.getContent()));
                                }
                            }
                        }
                        messages.add(new UserMessage(userMessage));

                        AgentProgressListener.emit("🤖 Reasoning over execution options and cognitive constraints...");

                        // Stream tokens incrementally in real time
                        reactor.core.publisher.Flux<String> streamFlux = chatClient.prompt()
                                .messages(messages)
                                .functions(
                                        "createCommitmentFunction",
                                        "getPlanFunction",
                                        "postponeCommitmentFunction",
                                        "completeCommitmentFunction",
                                        "markCommitmentMissedFunction",
                                        "deleteCommitmentFunction",
                                        "stressTestScheduleFunction",
                                        "detectExcuseFunction",
                                        "generatePartnerBriefFunction",
                                        "submitEveningReviewFunction"
                                )
                                .stream()
                                .content();

                        streamFlux.doOnNext(chunk -> {
                            if (chunk != null && !chunk.isEmpty()) {
                                replyBuffer.append(chunk);
                                try {
                                    emitter.send(SseEmitter.event()
                                            .name("DELTA")
                                            .data(AgentStreamEvent.delta(chunk)));
                                } catch (Exception ignored) {
                                }
                            }
                        }).blockLast();
                    }
                } catch (Exception e) {
                    log.warn("Streaming execution fallback for user {}: {}", userId, e.getMessage());
                }

                // Collect executed actions in this turn
                List<AgentActionLog> turnLogs = actionLogRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                        .filter(l -> l.getCreatedAt().isAfter(turnStart.minusSeconds(2)))
                        .collect(Collectors.toList());

                // If replyBuffer is empty, provide accurate summary or coaching response without mutating
                if (replyBuffer.isEmpty()) {
                    if (!turnLogs.isEmpty()) {
                        String summary = "⚡ **Executed Actions:**\n" + turnLogs.stream()
                                .map(l -> "* " + l.getDescription())
                                .collect(Collectors.joining("\n"));
                        replyBuffer.append(summary);
                    } else {
                        String heuristic = handleHeuristicExecutionAndReply(user, todayPlan, yesterdayPlan, userMessage);
                        replyBuffer.append(heuristic);
                    }
                    emitter.send(SseEmitter.event().name("DELTA").data(AgentStreamEvent.delta(replyBuffer.toString())));
                }

                List<AgentActionReceipt> receipts = turnLogs.stream().map(l -> new AgentActionReceipt(
                        l.getId(),
                        l.getActionType(),
                        l.getDescription(),
                        l.isUndone(),
                        l.getCreatedAt()
                )).collect(Collectors.toList());

                int totalMinutes = (int) todayPlan.getOrDefault("totalEstimatedMinutes", 0);
                String cognitiveWarning = null;
                if (totalMinutes > 360) {
                    cognitiveWarning = "Warning: You have " + totalMinutes + " minutes scheduled today (> 6 hours). Consider pruning non-essential commitments.";
                }

                boolean undoAvailable = !receipts.isEmpty();

                emitter.send(SseEmitter.event()
                        .name("DONE")
                        .data(AgentStreamEvent.done(
                                replyBuffer.toString().trim(),
                                receipts,
                                undoAvailable,
                                cognitiveWarning
                        )));

                emitter.complete();
            } catch (Exception e) {
                log.error("Streaming chat failed for user {}: {}", userId, e.getMessage());
                try {
                    emitter.send(SseEmitter.event()
                            .name("ERROR")
                            .data(AgentStreamEvent.error(e.getMessage() != null ? e.getMessage() : "Agent execution error.")));
                    emitter.completeWithError(e);
                } catch (Exception ignored) {
                }
            } finally {
                SecurityContextHolder.clearContext();
                AgentProgressListener.clear();
            }
        });

        return emitter;
    }

    @Transactional
    public AgentActionReceipt undoLastAction(UUID userId) {
        AgentActionLog actionLog = actionLogRepository.findFirstByUserIdAndUndoneFalseOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new BadRequestException("No recent agent actions available to undo."));

        revertAction(actionLog, userId);
        actionLog.setUndone(true);
        AgentActionLog saved = actionLogRepository.save(actionLog);

        statsService.refreshStatsAsync(userId);

        return new AgentActionReceipt(
                saved.getId(),
                saved.getActionType(),
                "Reverted: " + saved.getDescription(),
                true,
                saved.getCreatedAt()
        );
    }

    @Transactional
    public AgentActionReceipt undoActionById(UUID userId, UUID logId) {
        AgentActionLog actionLog = actionLogRepository.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent action log not found with id: " + logId));

        if (actionLog.isUndone()) {
            throw new BadRequestException("This action has already been undone.");
        }

        revertAction(actionLog, userId);
        actionLog.setUndone(true);
        AgentActionLog saved = actionLogRepository.save(actionLog);

        statsService.refreshStatsAsync(userId);

        return new AgentActionReceipt(
                saved.getId(),
                saved.getActionType(),
                "Reverted: " + saved.getDescription(),
                true,
                saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<AgentActionReceipt> getRecentLogs(UUID userId) {
        return actionLogRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .limit(20)
                .map(l -> new AgentActionReceipt(l.getId(), l.getActionType(), l.getDescription(), l.isUndone(), l.getCreatedAt()))
                .collect(Collectors.toList());
    }

    private void revertAction(AgentActionLog log, UUID userId) {
        try {
            switch (log.getActionType()) {
                case "CREATE_COMMITMENT" -> {
                    if (log.getTargetEntityId() != null) {
                        commitmentRepository.findActiveByIdAndUserId(log.getTargetEntityId(), userId)
                                .ifPresent(commitmentRepository::delete);
                    }
                }
                case "POSTPONE_COMMITMENT" -> {
                    if (log.getTargetEntityId() != null && log.getBeforeStateJson() != null) {
                        Commitment c = commitmentRepository.findActiveByIdAndUserId(log.getTargetEntityId(), userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Commitment not found"));
                        JsonNode before = objectMapper.readTree(log.getBeforeStateJson());
                        c.setCommitmentDate(LocalDate.now());
                        c.setStatus(CommitmentStatus.PENDING);
                        c.setPostponeReason(before.has("postponeReason") && !before.get("postponeReason").isNull() ? before.get("postponeReason").asText() : null);
                        c.setPostponementCount(before.has("postponementCount") ? before.get("postponementCount").asInt() : Math.max(0, c.getPostponementCount() - 1));
                        commitmentRepository.save(c);
                    }
                }
                case "COMPLETE_COMMITMENT" -> {
                    if (log.getTargetEntityId() != null) {
                        Commitment c = commitmentRepository.findActiveByIdAndUserId(log.getTargetEntityId(), userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Commitment not found"));
                        c.setStatus(CommitmentStatus.PENDING);
                        c.setCompletedAt(null);
                        commitmentRepository.save(c);
                    }
                }
                case "MARK_MISSED" -> {
                    if (log.getTargetEntityId() != null) {
                        Commitment c = commitmentRepository.findActiveByIdAndUserId(log.getTargetEntityId(), userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Commitment not found"));
                        c.setStatus(CommitmentStatus.PENDING);
                        commitmentRepository.save(c);
                    }
                }
                case "DELETE_COMMITMENT" -> {
                    if (log.getTargetEntityId() != null) {
                        commitmentRepository.findById(log.getTargetEntityId()).ifPresent(c -> {
                            if (c.getUser().getId().equals(userId)) {
                                c.setDeleted(false);
                                commitmentRepository.save(c);
                            }
                        });
                    }
                }
                default -> throw new BadRequestException("Action type " + log.getActionType() + " cannot be automatically reverted.");
            }
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to revert agent action: " + e.getMessage(), e);
        }
    }

    private String buildSystemPrompt(AiPersona persona, Map<String, Object> todayPlan, Map<String, Object> yesterdayPlan) {
        String basePrompt = "";
        try {
            if (agentSystemPrompt != null) {
                basePrompt = agentSystemPrompt.getContentAsString(StandardCharsets.UTF_8);
            }
        } catch (Exception ignored) {
        }

        if (basePrompt.isBlank()) {
            basePrompt = "You are the AazDoh Cognitive Accountability Coach. Help the user execute daily commitments with zero BS.";
        }

        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        LocalDate yesterday = today.minusDays(1);

        String todayJson = "{}";
        String yesterdayJson = "{}";
        try {
            todayJson = objectMapper.writeValueAsString(todayPlan);
            yesterdayJson = objectMapper.writeValueAsString(yesterdayPlan);
        } catch (Exception ignored) {}

        return basePrompt
                .replace("{persona}", persona.name())
                .replace("{todayDate}", today.toString())
                .replace("{tomorrowDate}", tomorrow.toString())
                .replace("{yesterdayDate}", yesterday.toString())
                + "\n\nTEMPORAL CALENDAR CONTEXT:"
                + "\n- TODAY'S DATE: " + today + " (" + today.getDayOfWeek() + ")"
                + "\n- TOMORROW'S DATE: " + tomorrow + " (" + tomorrow.getDayOfWeek() + ")"
                + "\n- YESTERDAY'S DATE: " + yesterday + " (" + yesterday.getDayOfWeek() + ")"
                + "\n\nCURRENT USER TODAY STATE (" + today + "):\n" + todayJson
                + "\n\nYESTERDAY STATE (" + yesterday + "):\n" + yesterdayJson;
    }

    private String handleHeuristicExecutionAndReply(User user, Map<String, Object> todayPlan, Map<String, Object> yesterdayPlan, String prompt) {
        String lower = prompt.toLowerCase();
        int pending = (int) (long) todayPlan.getOrDefault("pendingCommitments", 0L);
        int totalMinutes = (int) todayPlan.getOrDefault("totalEstimatedMinutes", 0);

        if (lower.contains("audit") || lower.contains("plan") || lower.contains("today") || lower.contains("schedule")) {
            if (pending == 0) {
                return "⚡ **Progress:** 0 pending commitments for today. Add 2-3 focused priorities to establish your execution baseline.";
            }
            if (totalMinutes > 360) {
                return String.format("⚡ **Status:** %d pending (%d mins scheduled).\n* **Risk:** Exceeds daily cognitive capacity (>6h).\n* **Action:** Prune or postpone non-essential tasks to tomorrow.", pending, totalMinutes);
            }
            return String.format("⚡ **Status:** %d pending commitments (%d mins scheduled).\n* **Calibration:** Optimal cognitive load.\n* **Action:** Execute your highest friction task first while fresh.", pending, totalMinutes);
        }

        return String.format("⚡ **Tracking:** %d active commitments today (%d mins). What is your immediate focus?", pending, totalMinutes);
    }
}
