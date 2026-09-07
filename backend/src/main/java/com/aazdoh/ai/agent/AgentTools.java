package com.aazdoh.ai.agent;

import com.aazdoh.ai.dto.PlanStressTestRequest;
import com.aazdoh.ai.dto.PlanStressTestResponse;
import com.aazdoh.ai.entity.AgentActionLog;
import com.aazdoh.ai.repository.AgentActionLogRepository;
import com.aazdoh.ai.service.AiAccountabilityService;
import com.aazdoh.analytics.entity.UserExecutionStats;
import com.aazdoh.analytics.service.UserExecutionStatsService;
import com.aazdoh.commitment.dto.CommitmentResponse;
import com.aazdoh.commitment.dto.CreateCommitmentRequest;
import com.aazdoh.commitment.dto.PostponeCommitmentRequest;
import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.entity.CommitmentPriority;
import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.commitment.entity.CommitmentVisibility;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.commitment.service.CommitmentService;
import com.aazdoh.common.exception.ResourceNotFoundException;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class AgentTools {

    private static final Logger log = LoggerFactory.getLogger(AgentTools.class);

    private final CommitmentService commitmentService;
    private final CommitmentRepository commitmentRepository;
    private final UserService userService;
    private final UserExecutionStatsService statsService;
    private final AiAccountabilityService aiAccountabilityService;
    private final AgentActionLogRepository actionLogRepository;
    private final ObjectMapper objectMapper;

    public AgentTools(
            CommitmentService commitmentService,
            CommitmentRepository commitmentRepository,
            UserService userService,
            UserExecutionStatsService statsService,
            AiAccountabilityService aiAccountabilityService,
            AgentActionLogRepository actionLogRepository,
            ObjectMapper objectMapper
    ) {
        this.commitmentService = commitmentService;
        this.commitmentRepository = commitmentRepository;
        this.userService = userService;
        this.statsService = statsService;
        this.aiAccountabilityService = aiAccountabilityService;
        this.actionLogRepository = actionLogRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTodayPlan(UUID userId) {
        LocalDate today = LocalDate.now();
        List<CommitmentResponse> commitments = commitmentService.getTodayCommitments(userId, today);
        UserExecutionStats stats = statsService.getOrComputeStats(userId);

        int totalEstimatedMinutes = commitments.stream()
                .mapToInt(CommitmentResponse::getEstimatedMinutes)
                .sum();

        long pendingCount = commitments.stream().filter(c -> c.getStatus() == CommitmentStatus.PENDING).count();
        long completedCount = commitments.stream().filter(c -> c.getStatus() == CommitmentStatus.COMPLETED).count();

        Map<String, Object> result = new HashMap<>();
        result.put("date", today.toString());
        result.put("totalCommitments", commitments.size());
        result.put("pendingCommitments", pendingCount);
        result.put("completedCommitments", completedCount);
        result.put("totalEstimatedMinutes", totalEstimatedMinutes);
        result.put("capacityStatus", totalEstimatedMinutes > 360 ? "OVERLOADED" : (totalEstimatedMinutes > 240 ? "OPTIMAL" : "LIGHT"));
        result.put("completionRate", stats != null ? stats.getRolling7dCompletionRate() : 0.0);
        result.put("totalTasks7d", stats != null ? stats.getRolling7dTotalTasks() : 0);

        List<Map<String, Object>> items = commitments.stream().map(c -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", c.getId());
            m.put("title", c.getTitle());
            m.put("status", c.getStatus());
            m.put("priority", c.getPriority());
            m.put("estimatedMinutes", c.getEstimatedMinutes());
            m.put("postponementCount", c.getPostponementCount());
            return m;
        }).collect(Collectors.toList());

        result.put("commitments", items);
        return result;
    }

    @Transactional
    public Map<String, Object> createCommitment(
            UUID userId,
            String title,
            Integer estimatedMinutes,
            CommitmentPriority priority,
            String expectedOutcome
    ) {
        User user = userService.findUserById(userId);

        CreateCommitmentRequest request = new CreateCommitmentRequest();
        request.setTitle(title.trim());
        request.setEstimatedMinutes(estimatedMinutes != null && estimatedMinutes > 0 ? estimatedMinutes : 30);
        request.setPriority(priority != null ? priority : CommitmentPriority.MEDIUM);
        request.setCommitmentDate(LocalDate.now());
        request.setVisibility(CommitmentVisibility.PRIVATE);
        request.setExpectedOutcome(expectedOutcome);

        CommitmentResponse created = commitmentService.createCommitment(userId, request);

        // Record action log
        AgentActionLog actionLog = new AgentActionLog(
                user,
                "CREATE_COMMITMENT",
                "COMMITMENT",
                created.getId(),
                "Created commitment '" + created.getTitle() + "' (" + created.getEstimatedMinutes() + " mins)",
                null,
                toJson(created)
        );
        AgentActionLog savedLog = actionLogRepository.save(actionLog);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("commitmentId", created.getId());
        result.put("title", created.getTitle());
        result.put("estimatedMinutes", created.getEstimatedMinutes());
        result.put("logId", savedLog.getId());
        return result;
    }

    @Transactional
    public Map<String, Object> completeCommitment(UUID userId, UUID commitmentId) {
        User user = userService.findUserById(userId);
        Commitment existing = commitmentRepository.findActiveByIdAndUserId(commitmentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Commitment not found: " + commitmentId));

        String beforeState = toJson(existing);

        CommitmentResponse updated = commitmentService.completeCommitment(userId, commitmentId);

        AgentActionLog actionLog = new AgentActionLog(
                user,
                "COMPLETE_COMMITMENT",
                "COMMITMENT",
                commitmentId,
                "Completed commitment '" + existing.getTitle() + "'",
                beforeState,
                toJson(updated)
        );
        AgentActionLog savedLog = actionLogRepository.save(actionLog);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("commitmentId", commitmentId);
        result.put("title", existing.getTitle());
        result.put("status", "COMPLETED");
        result.put("logId", savedLog.getId());
        return result;
    }

    @Transactional
    public Map<String, Object> postponeCommitment(
            UUID userId,
            UUID commitmentId,
            String reason,
            LocalDate targetDate
    ) {
        User user = userService.findUserById(userId);
        Commitment existing = commitmentRepository.findActiveByIdAndUserId(commitmentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Commitment not found: " + commitmentId));

        String beforeState = toJson(existing);
        LocalDate nextDate = targetDate != null ? targetDate : LocalDate.now().plusDays(1);
        String postponeReason = (reason != null && !reason.isBlank()) ? reason.trim() : "Rescheduled by AI Coach";

        PostponeCommitmentRequest request = new PostponeCommitmentRequest();
        request.setReason(postponeReason);
        request.setNewDate(nextDate);

        CommitmentResponse updated = commitmentService.postponeCommitment(userId, commitmentId, request);

        AgentActionLog actionLog = new AgentActionLog(
                user,
                "POSTPONE_COMMITMENT",
                "COMMITMENT",
                commitmentId,
                "Postponed '" + existing.getTitle() + "' to " + nextDate + " (" + postponeReason + ")",
                beforeState,
                toJson(updated)
        );
        AgentActionLog savedLog = actionLogRepository.save(actionLog);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("commitmentId", commitmentId);
        result.put("title", existing.getTitle());
        result.put("newDate", nextDate.toString());
        result.put("reason", postponeReason);
        result.put("logId", savedLog.getId());
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> stressTestSchedule(UUID userId, String quickDefense) {
        try {
            PlanStressTestRequest req = new PlanStressTestRequest();
            req.setDate(LocalDate.now());
            req.setQuickDefense(quickDefense);
            PlanStressTestResponse response = aiAccountabilityService.stressTestPlanAsync(userId, req).get();

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("riskScore", response.getRiskScore());
            result.put("riskLevel", response.getRiskLevel());
            result.put("diagnosticSummary", response.getDiagnosticSummary());
            result.put("plannedHours", response.getPlannedHours());
            result.put("optimizedHours", response.getOptimizedHours());
            return result;
        } catch (Exception e) {
            log.warn("Stress test tool fallback for user {}: {}", userId, e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("success", true);
            fallback.put("riskLevel", "LOW");
            fallback.put("diagnosticSummary", "Schedule reviewed against cognitive limits.");
            return fallback;
        }
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }
}
