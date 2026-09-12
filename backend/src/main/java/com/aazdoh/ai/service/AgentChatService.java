package com.aazdoh.ai.service;

import com.aazdoh.ai.agent.AgentProgressListener;
import com.aazdoh.ai.agent.AgentTools;
import com.aazdoh.ai.dto.AgentActionItem;
import com.aazdoh.ai.dto.AgentActionReceipt;
import com.aazdoh.ai.dto.AgentChatMessageDto;
import com.aazdoh.ai.dto.AgentChatRequest;
import com.aazdoh.ai.dto.AgentChatResponse;
import com.aazdoh.ai.dto.AgentDecisionPlan;
import com.aazdoh.ai.dto.AgentStreamEvent;
import com.aazdoh.ai.entity.AgentActionLog;
import com.aazdoh.ai.repository.AgentActionLogRepository;
import com.aazdoh.analytics.service.UserExecutionStatsService;
import com.aazdoh.commitment.dto.PostponeCommitmentRequest;
import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.entity.CommitmentPriority;
import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.commitment.service.CommitmentService;
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
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.publisher.Flux;
import com.fasterxml.jackson.core.type.TypeReference;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

@Service
public class AgentChatService {

    private static final Logger log = LoggerFactory.getLogger(AgentChatService.class);

    private final ChatClient chatClient;
    private final AgentTools agentTools;
    private final AgentActionLogRepository actionLogRepository;
    private final CommitmentRepository commitmentRepository;
    private final CommitmentService commitmentService;
    private final UserService userService;
    private final UserExecutionStatsService statsService;
    private final ObjectMapper objectMapper;

    @Value("${aazdoh.ai.enabled:true}")
    private boolean aiEnabled;

    @Value("${aazdoh.ai.fallback-models:gemini-3.6-flash,gemini-3.5-flash}")
    private List<String> fallbackModels;

    @Value("classpath:/prompts/agent-system.st")
    private Resource agentSystemPrompt;

    public AgentChatService(
            ChatClient chatClient,
            AgentTools agentTools,
            AgentActionLogRepository actionLogRepository,
            CommitmentRepository commitmentRepository,
            CommitmentService commitmentService,
            UserService userService,
            UserExecutionStatsService statsService,
            ObjectMapper objectMapper
    ) {
        this.chatClient = chatClient;
        this.agentTools = agentTools;
        this.actionLogRepository = actionLogRepository;
        this.commitmentRepository = commitmentRepository;
        this.commitmentService = commitmentService;
        this.userService = userService;
        this.statsService = statsService;
        this.objectMapper = objectMapper;
    }

    private List<String> getCandidateModels() {
        List<String> list = new ArrayList<>();
        if (fallbackModels != null && !fallbackModels.isEmpty()) {
            for (String m : fallbackModels) {
                if (m != null && !m.trim().isEmpty() && !list.contains(m.trim())) {
                    list.add(m.trim());
                }
            }
        }
        if (list.isEmpty()) {
            list.add("gemini-3.6-flash");
        }
        return list;
    }

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

                List<String> candidateModels = getCandidateModels();
                Exception lastException = null;

                for (int i = 0; i < candidateModels.size(); i++) {
                    String modelName = candidateModels.get(i);
                    try {
                        log.info("Executing Agent reasoning with model: {}", modelName);
                        AgentProgressListener.emit("🤖 Reasoning over execution options with " + modelName + "...");

                        String rawResponse = chatClient.prompt()
                                .options(OpenAiChatOptions.builder().withModel(modelName).build())
                                .messages(messages)
                                .call()
                                .content();

                        if (rawResponse != null && !rawResponse.isBlank()) {
                            AgentDecisionPlan plan = parseDecisionPlan(rawResponse);
                            if (plan != null) {
                                executeActionPlan(userId, plan, todayPlan, yesterdayPlan);
                                reply = plan.getReply();
                            } else {
                                reply = rawResponse.trim();
                            }
                            lastException = null;
                            break;
                        }
                    } catch (Exception ex) {
                        lastException = ex;
                        log.warn("Model '{}' failed ({}: {}). Failing over to next fallback...",
                                modelName, ex.getClass().getSimpleName(), ex.getMessage());
                        if (i < candidateModels.size() - 1) {
                            String nextModel = candidateModels.get(i + 1);
                            AgentProgressListener.emit("⚠️ " + modelName + " failed. Switching to fallback " + nextModel + "...");
                        }
                    }
                }

                if (lastException != null && (reply == null || reply.isBlank())) {
                    log.warn("All AI models in fallback chain threw exception: {}", lastException.getMessage());
                    reply = null;
                }
            }
        } catch (Exception e) {
            log.warn("Spring AI execution encountered exception: {}", e.getMessage());
            reply = null;
        }

        // 3. Find any action logs created in this turn
        List<AgentActionLog> turnLogs = actionLogRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(l -> l.getCreatedAt().isAfter(turnStart.minusSeconds(2)))
                .collect(Collectors.toList());

        if (reply == null || reply.isBlank() || reply.contains("thought_signature") || reply.startsWith("⚠️ **AI Error:**")) {
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
        SseEmitter emitter = new SseEmitter(180_000L);
        emitter.onCompletion(() -> log.debug("SSE stream completed for user {}", userId));
        emitter.onTimeout(() -> {
            log.warn("SSE stream timed out for user {}", userId);
            try {
                emitter.complete();
            } catch (Exception ignored) {}
        });
        emitter.onError(e -> {
            log.debug("SSE stream error for user {}: {}", userId, e.getMessage());
            try {
                emitter.complete();
            } catch (Exception ignored) {}
        });

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

                Map<String, Object> todayPlan = agentTools.getTodayPlan(userId);
                Map<String, Object> yesterdayPlan = agentTools.getPlanForDate(userId, LocalDate.now().minusDays(1));
                String systemPromptText = buildSystemPrompt(persona, todayPlan, yesterdayPlan);

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
                messages.add(new UserMessage(request.getMessage().trim()));

                List<String> candidateModels = getCandidateModels();
                String rawAccumulated = null;

                if (aiEnabled && chatClient != null) {
                    for (int i = 0; i < candidateModels.size(); i++) {
                        String modelName = candidateModels.get(i);
                        try {
                            log.info("Executing reactive streaming Agent with model: {}", modelName);
                            AgentProgressListener.emit("🤖 Reasoning over execution options with " + modelName + "...");

                            StringBuilder accumulated = new StringBuilder();
                            AtomicBoolean isBufferingActions = new AtomicBoolean(false);

                            Flux<String> streamFlux = chatClient.prompt()
                                    .options(OpenAiChatOptions.builder().withModel(modelName).build())
                                    .messages(messages)
                                    .stream()
                                    .content();

                            streamFlux.doOnNext(chunk -> {
                                if (chunk == null || chunk.isEmpty()) return;
                                accumulated.append(chunk);
                                String current = accumulated.toString();

                                if (current.contains("```actions") || current.contains("```json")) {
                                    isBufferingActions.set(true);
                                }

                                if (!isBufferingActions.get()) {
                                    try {
                                        emitter.send(SseEmitter.event()
                                                .name("DELTA")
                                                .data(AgentStreamEvent.delta(chunk)));
                                    } catch (Exception ignored) {}
                                }
                            }).blockLast();

                            rawAccumulated = accumulated.toString();
                            if (!rawAccumulated.isBlank()) {
                                break;
                            }
                        } catch (Exception ex) {
                            log.warn("Streaming model '{}' failed ({}: {}). Trying fallback...",
                                    modelName, ex.getClass().getSimpleName(), ex.getMessage());
                            if (i < candidateModels.size() - 1) {
                                String nextModel = candidateModels.get(i + 1);
                                AgentProgressListener.emit("⚠️ " + modelName + " failed. Switching to fallback " + nextModel + "...");
                            }
                        }
                    }
                }

                String reply = null;
                if (rawAccumulated != null && !rawAccumulated.isBlank()) {
                    AgentDecisionPlan plan = parseDecisionPlan(rawAccumulated);
                    if (plan != null) {
                        executeActionPlan(userId, plan, todayPlan, yesterdayPlan);
                        reply = plan.getReply();
                    } else {
                        reply = rawAccumulated.replaceAll("```actions[\\s\\S]*?```", "").trim();
                    }
                }

                List<AgentActionLog> turnLogs = actionLogRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                        .filter(l -> l.getCreatedAt().isAfter(turnStart.minusSeconds(2)))
                        .collect(Collectors.toList());

                if (reply == null || reply.isBlank() || reply.contains("thought_signature") || reply.startsWith("⚠️ **AI Error:**")) {
                    if (!turnLogs.isEmpty()) {
                        reply = "⚡ **Executed Actions:**\n" + turnLogs.stream()
                                .map(l -> "* " + l.getDescription())
                                .collect(Collectors.joining("\n"));
                    } else {
                        reply = handleHeuristicExecutionAndReply(user, todayPlan, yesterdayPlan, request.getMessage().trim());
                    }
                    try {
                        emitter.send(SseEmitter.event()
                                .name("DELTA")
                                .data(AgentStreamEvent.delta(reply)));
                    } catch (Exception ignored) {}
                }

                List<AgentActionReceipt> receipts = turnLogs.stream().map(l -> new AgentActionReceipt(
                        l.getId(),
                        l.getActionType(),
                        l.getDescription(),
                        l.isUndone(),
                        l.getCreatedAt()
                )).collect(Collectors.toList());

                int totalMinutes = (int) todayPlan.getOrDefault("totalEstimatedMinutes", 0);
                String cognitiveWarning = totalMinutes > 360
                        ? "Warning: You have " + totalMinutes + " minutes scheduled today (> 6 hours). Consider pruning non-essential commitments."
                        : null;

                boolean undoAvailable = !receipts.isEmpty();

                emitter.send(SseEmitter.event()
                        .name("DONE")
                        .data(AgentStreamEvent.done(
                                reply != null ? reply.trim() : "",
                                receipts,
                                undoAvailable,
                                cognitiveWarning
                        )));

                emitter.complete();
            } catch (Exception e) {
                log.error("Streaming chat failed for user {}: {}", userId, e.getMessage(), e);
                try {
                    emitter.send(SseEmitter.event()
                            .name("ERROR")
                            .data(AgentStreamEvent.error(e.getMessage() != null ? e.getMessage() : "Agent execution error.")));
                } catch (Exception ignored) {
                } finally {
                    try {
                        emitter.complete();
                    } catch (Exception ignored) {}
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
                                c.setDeletedAt(null);
                                commitmentRepository.save(c);
                            }
                        });
                    }
                }
                case "UPDATE_COMMITMENT" -> {
                    if (log.getTargetEntityId() != null && log.getBeforeStateJson() != null) {
                        Commitment c = commitmentRepository.findActiveByIdAndUserId(log.getTargetEntityId(), userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Commitment not found"));
                        JsonNode before = objectMapper.readTree(log.getBeforeStateJson());
                        if (before.has("title")) c.setTitle(before.get("title").asText());
                        if (before.has("estimatedMinutes")) c.setEstimatedMinutes(before.get("estimatedMinutes").asInt());
                        if (before.has("priority")) {
                            try { c.setPriority(com.aazdoh.commitment.entity.CommitmentPriority.valueOf(before.get("priority").asText())); } catch (Exception ignored) {}
                        }
                        if (before.has("category")) {
                            try { c.setCategory(com.aazdoh.commitment.entity.CommitmentCategory.valueOf(before.get("category").asText())); } catch (Exception ignored) {}
                        }
                        if (before.has("expectedOutcome")) {
                            c.setExpectedOutcome(before.get("expectedOutcome").isNull() ? null : before.get("expectedOutcome").asText());
                        }
                        if (before.has("commitmentDate")) {
                            c.setCommitmentDate(LocalDate.parse(before.get("commitmentDate").asText()));
                        }
                        commitmentRepository.save(c);
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

        String todaySchedule = formatCompactSchedule(todayPlan);
        String yesterdaySchedule = formatCompactSchedule(yesterdayPlan);

        return basePrompt
                .replace("{persona}", persona.name())
                .replace("{todayDate}", today.toString())
                .replace("{tomorrowDate}", tomorrow.toString())
                .replace("{yesterdayDate}", yesterday.toString())
                + "\n\nTEMPORAL CALENDAR CONTEXT:"
                + "\n- TODAY'S DATE: " + today + " (" + today.getDayOfWeek() + ")"
                + "\n- TOMORROW'S DATE: " + tomorrow + " (" + tomorrow.getDayOfWeek() + ")"
                + "\n- YESTERDAY'S DATE: " + yesterday + " (" + yesterday.getDayOfWeek() + ")"
                + "\n\nCURRENT USER SCHEDULE TODAY (" + today + "):\n" + todaySchedule
                + "\n\nUSER SCHEDULE YESTERDAY (" + yesterday + "):\n" + yesterdaySchedule;
    }

    @SuppressWarnings("unchecked")
    private String formatCompactSchedule(Map<String, Object> plan) {
        if (plan == null) return "No plan recorded.";
        List<Map<String, Object>> commitments = (List<Map<String, Object>>) plan.getOrDefault("commitments", Collections.emptyList());
        if (commitments.isEmpty()) {
            return "0 commitments scheduled.";
        }
        int totalMinutes = (int) plan.getOrDefault("totalEstimatedMinutes", 0);
        long completed = (long) plan.getOrDefault("completedCommitments", 0L);
        long pending = (long) plan.getOrDefault("pendingCommitments", 0L);
        long missed = (long) plan.getOrDefault("missedCommitments", 0L);

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Total: %dm scheduled | %d Pending, %d Done, %d Missed\n", totalMinutes, pending, completed, missed));
        for (Map<String, Object> c : commitments) {
            String title = String.valueOf(c.get("title"));
            String status = String.valueOf(c.get("status"));
            Object est = c.get("estimatedMinutes");
            Object priority = c.get("priority");
            Object category = c.get("category");
            sb.append(String.format("- [%s] \"%s\" (~%sm, Priority: %s, %s)\n",
                    status, title, est != null ? est : 30, priority != null ? priority : "MEDIUM", category != null ? category : "DEEP_WORK"));
        }
        return sb.toString().trim();
    }

    @SuppressWarnings("unchecked")
    private String handleHeuristicExecutionAndReply(User user, Map<String, Object> todayPlan, Map<String, Object> yesterdayPlan, String prompt) {
        String lower = prompt.toLowerCase().trim();
        List<Map<String, Object>> todayCommitments = (List<Map<String, Object>>) todayPlan.getOrDefault("commitments", new ArrayList<>());
        List<Map<String, Object>> yesterdayCommitments = yesterdayPlan != null
                ? (List<Map<String, Object>>) yesterdayPlan.getOrDefault("commitments", new ArrayList<>())
                : Collections.emptyList();

        int pending = (int) (long) todayPlan.getOrDefault("pendingCommitments", 0L);
        int totalMinutes = (int) todayPlan.getOrDefault("totalEstimatedMinutes", 0);

        // 1. Completion intent (e.g. "done TUF DSA", "completed 2 leetcode", "finished reading")
        if (lower.startsWith("done ") || lower.startsWith("completed ") || lower.startsWith("finished ") || lower.startsWith("did ") || lower.contains("marked done") || lower.contains("done with")) {
            String target = lower.replaceFirst("^(done with|done|completed|finished|did|marked done)\\s+", "").trim();

            // Check today first
            UUID matchId = findMatchingCommitmentId(todayCommitments, target, "ACTIVE_OR_MISSED");
            String matchedTitle = target;
            if (matchId != null) {
                Map<String, Object> match = findCommitmentById(todayCommitments, matchId);
                if (match != null && match.get("title") != null) matchedTitle = String.valueOf(match.get("title"));
                agentTools.completeCommitment(user.getId(), matchId);
                return String.format("⚡ **Executed Action:** Marked '%s' as COMPLETED.", matchedTitle);
            }

            // Check yesterday
            UUID yMatchId = findMatchingCommitmentId(yesterdayCommitments, target, "ACTIVE_OR_MISSED");
            if (yMatchId != null) {
                Map<String, Object> match = findCommitmentById(yesterdayCommitments, yMatchId);
                if (match != null && match.get("title") != null) matchedTitle = String.valueOf(match.get("title"));
                agentTools.completeCommitment(user.getId(), yMatchId);
                return String.format("⚡ **Executed Action:** Marked yesterday's '%s' as COMPLETED.", matchedTitle);
            }

            // If task was not scheduled today or yesterday, auto-log it as a completed commitment
            if (!target.isBlank()) {
                String properTitle = Character.toUpperCase(target.charAt(0)) + target.substring(1);
                Map<String, Object> created = agentTools.createCommitment(user.getId(), properTitle, 30, CommitmentPriority.MEDIUM, "Logged and completed via coach");
                if (created != null && created.get("id") != null) {
                    agentTools.completeCommitment(user.getId(), (UUID) created.get("id"));
                    return String.format("⚡ **Executed Action:** Auto-logged and completed '%s' (30m).", properTitle);
                }
            }
        }

        // 2. Postpone intent (e.g. "postpone TUF DSA", "move reading to tomorrow")
        if (lower.startsWith("postpone ") || lower.startsWith("move ") || lower.startsWith("reschedule ") || lower.contains("to tomorrow")) {
            String target = lower.replaceFirst("^(postpone|move|reschedule)\\s+", "").replaceAll("(?i)\\s+(to tomorrow|tomorrow)$", "").trim();
            UUID matchId = findMatchingCommitmentId(todayCommitments, target, "ACTIVE_OR_MISSED");
            if (matchId == null) {
                matchId = findMatchingCommitmentId(yesterdayCommitments, target, "ACTIVE_OR_MISSED");
            }
            if (matchId != null) {
                Map<String, Object> match = findCommitmentById(todayCommitments, matchId);
                if (match == null) match = findCommitmentById(yesterdayCommitments, matchId);
                String title = match != null && match.get("title") != null ? String.valueOf(match.get("title")) : target;

                PostponeCommitmentRequest req = new PostponeCommitmentRequest();
                req.setNewDate(LocalDate.now().plusDays(1));
                req.setReason("Rebalanced via coach");
                commitmentService.postponeCommitment(user.getId(), matchId, req);
                return String.format("⚡ **Executed Action:** Postponed '%s' to tomorrow (%s).", title, LocalDate.now().plusDays(1));
            }
        }

        // 3. Audit / status intent
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

    private AgentDecisionPlan parseDecisionPlan(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try {
            String clean = raw.trim();

            // 1. Text-First + ```actions [ ... ] ``` format
            if (clean.contains("```actions")) {
                int startIdx = clean.indexOf("```actions");
                int endIdx = clean.indexOf("```", startIdx + 10);
                String reply = clean.substring(0, startIdx).trim();
                String actionsJson = endIdx != -1
                        ? clean.substring(startIdx + 10, endIdx).trim()
                        : clean.substring(startIdx + 10).trim();

                List<AgentActionItem> actions = new ArrayList<>();
                if (!actionsJson.isBlank() && actionsJson.startsWith("[")) {
                    actions = objectMapper.readValue(actionsJson, new TypeReference<List<AgentActionItem>>() {});
                }
                return new AgentDecisionPlan("Text-first action plan", actions, reply);
            }

            // 2. Legacy JSON format ```json { ... } ``` or raw { ... }
            if (clean.startsWith("```json")) {
                clean = clean.substring(7);
            } else if (clean.startsWith("```")) {
                clean = clean.substring(3);
            }
            if (clean.endsWith("```")) {
                clean = clean.substring(0, clean.length() - 3);
            }
            clean = clean.trim();
            int firstBrace = clean.indexOf('{');
            int lastBrace = clean.lastIndexOf('}');
            if (firstBrace != -1 && lastBrace > firstBrace) {
                clean = clean.substring(firstBrace, lastBrace + 1);
                return objectMapper.readValue(clean, AgentDecisionPlan.class);
            }
        } catch (Exception e) {
            log.debug("Could not parse AgentDecisionPlan from LLM: {}", e.getMessage());
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private void executeActionPlan(UUID userId, AgentDecisionPlan plan, Map<String, Object> todayPlan, Map<String, Object> yesterdayPlan) {
        if (plan == null || plan.getActions() == null || plan.getActions().isEmpty()) {
            return;
        }

        List<Map<String, Object>> todayCommitments = (List<Map<String, Object>>) todayPlan.getOrDefault("commitments", new ArrayList<>());
        List<Map<String, Object>> yesterdayCommitments = yesterdayPlan != null
                ? (List<Map<String, Object>>) yesterdayPlan.getOrDefault("commitments", new ArrayList<>())
                : Collections.emptyList();

        for (AgentActionItem item : plan.getActions()) {
            if (item == null || item.getActionType() == null) continue;
            String type = item.getActionType().toUpperCase().trim();

            try {
                switch (type) {
                    case "COMPLETE_COMMITMENT" -> {
                        UUID targetId = item.getTargetId();
                        if (targetId == null && item.getTargetTitle() != null) {
                            targetId = findMatchingCommitmentId(todayCommitments, item.getTargetTitle(), "ACTIVE_OR_MISSED");
                            if (targetId == null) {
                                targetId = findMatchingCommitmentId(yesterdayCommitments, item.getTargetTitle(), "ACTIVE_OR_MISSED");
                            }
                        }
                        if (targetId != null) {
                            agentTools.completeCommitment(userId, targetId);
                        } else if (item.getTargetTitle() != null && !item.getTargetTitle().isBlank()) {
                            String title = item.getTargetTitle().trim();
                            int minutes = item.getEstimatedMinutes() != null ? item.getEstimatedMinutes() : 30;
                            Map<String, Object> created = agentTools.createCommitment(userId, title, minutes, CommitmentPriority.MEDIUM, "Logged via coach");
                            if (created != null && created.get("id") != null) {
                                agentTools.completeCommitment(userId, (UUID) created.get("id"));
                            }
                        }
                    }
                    case "CREATE_COMMITMENT" -> {
                        String title = item.getTitle() != null ? item.getTitle() : item.getTargetTitle();
                        if (title != null && !title.isBlank()) {
                            int minutes = item.getEstimatedMinutes() != null ? item.getEstimatedMinutes() : 30;
                            CommitmentPriority priority = parsePriority(item.getPriority());
                            String category = item.getCategory() != null ? item.getCategory() : "DEEP_WORK";
                            String outcome = item.getExpectedOutcome();
                            LocalDate targetDate = parseDate(item.getTargetDate());
                            agentTools.createCommitment(userId, title, minutes, priority, category, outcome, targetDate != null ? targetDate : LocalDate.now());
                        }
                    }
                    case "POSTPONE_COMMITMENT" -> {
                        UUID targetId = item.getTargetId();
                        if (targetId == null && item.getTargetTitle() != null) {
                            targetId = findMatchingCommitmentId(todayCommitments, item.getTargetTitle(), "ACTIVE_OR_MISSED");
                            if (targetId == null) {
                                targetId = findMatchingCommitmentId(yesterdayCommitments, item.getTargetTitle(), "ACTIVE_OR_MISSED");
                            }
                        }
                        if (targetId != null) {
                            LocalDate targetDate = parseDate(item.getTargetDate());
                            if (targetDate == null) targetDate = LocalDate.now().plusDays(1);
                            PostponeCommitmentRequest req = new PostponeCommitmentRequest();
                            req.setNewDate(targetDate);
                            req.setReason(item.getReason() != null ? item.getReason() : "Postponed via coach");
                            commitmentService.postponeCommitment(userId, targetId, req);
                        }
                    }
                    case "UPDATE_COMMITMENT" -> {
                        UUID targetId = item.getTargetId();
                        if (targetId == null && item.getTargetTitle() != null) {
                            targetId = findMatchingCommitmentId(todayCommitments, item.getTargetTitle(), null);
                            if (targetId == null) {
                                targetId = findMatchingCommitmentId(yesterdayCommitments, item.getTargetTitle(), null);
                            }
                        }
                        if (targetId != null) {
                            CommitmentPriority priority = item.getPriority() != null ? parsePriority(item.getPriority()) : null;
                            LocalDate targetDate = parseDate(item.getTargetDate());
                            agentTools.updateCommitment(userId, targetId, item.getTitle(), item.getEstimatedMinutes(), priority, item.getCategory(), item.getExpectedOutcome(), targetDate);
                        }
                    }
                    case "DELETE_COMMITMENT" -> {
                        UUID targetId = item.getTargetId();
                        if (targetId == null && item.getTargetTitle() != null) {
                            targetId = findMatchingCommitmentId(todayCommitments, item.getTargetTitle(), null);
                            if (targetId == null) {
                                targetId = findMatchingCommitmentId(yesterdayCommitments, item.getTargetTitle(), null);
                            }
                        }
                        if (targetId != null) {
                            agentTools.deleteCommitment(userId, targetId);
                        }
                    }
                    case "MARK_MISSED" -> {
                        UUID targetId = item.getTargetId();
                        if (targetId == null && item.getTargetTitle() != null) {
                            targetId = findMatchingCommitmentId(todayCommitments, item.getTargetTitle(), "PENDING");
                        }
                        if (targetId != null) {
                            agentTools.markCommitmentMissed(userId, targetId, item.getReason() != null ? item.getReason() : "Marked missed via coach");
                        }
                    }
                }
            } catch (Exception ex) {
                log.warn("Failed executing action {} for user {}: {}", type, userId, ex.getMessage());
            }
        }
    }

    private Map<String, Object> findCommitmentById(List<Map<String, Object>> commitments, UUID id) {
        if (commitments == null || id == null) return null;
        for (Map<String, Object> c : commitments) {
            if (id.equals(c.get("id"))) return c;
        }
        return null;
    }

    private UUID findMatchingCommitmentId(List<Map<String, Object>> commitments, String targetTitle, String allowedStatus) {
        if (targetTitle == null || targetTitle.isBlank() || commitments == null) return null;
        String cleanTarget = targetTitle.replaceAll("[^a-zA-Z0-9\\s]", " ").trim().toLowerCase();
        String[] targetTokens = cleanTarget.split("\\s+");

        UUID bestMatch = null;
        int maxScore = 0;

        for (Map<String, Object> c : commitments) {
            String status = String.valueOf(c.get("status"));
            if (allowedStatus != null && !allowedStatus.equalsIgnoreCase("ANY")) {
                if ("ACTIVE_OR_MISSED".equalsIgnoreCase(allowedStatus)) {
                    if ("COMPLETED".equalsIgnoreCase(status) || "DELETED".equalsIgnoreCase(status)) continue;
                } else if (!allowedStatus.equalsIgnoreCase(status)) {
                    continue;
                }
            } else if ("DELETED".equalsIgnoreCase(status)) {
                continue;
            }

            String title = String.valueOf(c.get("title"));
            String cleanTitle = title.replaceAll("[^a-zA-Z0-9\\s]", " ").trim().toLowerCase();

            if (cleanTitle.equals(cleanTarget)) {
                return (UUID) c.get("id"); // Exact match
            }

            if (cleanTitle.contains(cleanTarget) || cleanTarget.contains(cleanTitle)) {
                return (UUID) c.get("id"); // Substring match
            }

            // Token overlap score
            int score = 0;
            for (String token : targetTokens) {
                if (token.length() > 1 && cleanTitle.contains(token)) {
                    score++;
                }
            }
            if (score > maxScore) {
                maxScore = score;
                bestMatch = (UUID) c.get("id");
            }
        }

        return maxScore > 0 ? bestMatch : null;
    }

    private CommitmentPriority parsePriority(String p) {
        if (p == null) return CommitmentPriority.MEDIUM;
        try {
            return CommitmentPriority.valueOf(p.toUpperCase().trim());
        } catch (Exception e) {
            return CommitmentPriority.MEDIUM;
        }
    }

    private LocalDate parseDate(String d) {
        if (d == null || d.isBlank()) return null;
        try {
            String trimmed = d.trim();
            if ("today".equalsIgnoreCase(trimmed)) return LocalDate.now();
            if ("tomorrow".equalsIgnoreCase(trimmed)) return LocalDate.now().plusDays(1);
            if ("yesterday".equalsIgnoreCase(trimmed)) return LocalDate.now().minusDays(1);
            return LocalDate.parse(trimmed);
        } catch (Exception e) {
            return null;
        }
    }
}
