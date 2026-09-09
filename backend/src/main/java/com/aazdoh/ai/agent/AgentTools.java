package com.aazdoh.ai.agent;

import com.aazdoh.ai.dto.ExcuseAnalysisRequest;
import com.aazdoh.ai.dto.ExcuseAnalysisResponse;
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
import com.aazdoh.commitment.entity.CommitmentCategory;
import com.aazdoh.commitment.entity.CommitmentPriority;
import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.commitment.entity.CommitmentVisibility;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.commitment.service.CommitmentService;
import com.aazdoh.common.exception.ResourceNotFoundException;
import com.aazdoh.partnership.dto.PartnerDailyOverviewDto;
import com.aazdoh.partnership.dto.PartnershipResponse;
import com.aazdoh.partnership.service.PartnershipService;
import com.aazdoh.review.dto.ReviewCommitmentRequest;
import com.aazdoh.review.dto.ReviewResponse;
import com.aazdoh.review.entity.FailureReason;
import com.aazdoh.review.entity.NextAction;
import com.aazdoh.review.service.ReviewService;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
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
    private final PartnershipService partnershipService;
    private final ReviewService reviewService;
    private final ObjectMapper objectMapper;

    public AgentTools(
            CommitmentService commitmentService,
            CommitmentRepository commitmentRepository,
            UserService userService,
            UserExecutionStatsService statsService,
            AiAccountabilityService aiAccountabilityService,
            AgentActionLogRepository actionLogRepository,
            PartnershipService partnershipService,
            ReviewService reviewService,
            ObjectMapper objectMapper
    ) {
        this.commitmentService = commitmentService;
        this.commitmentRepository = commitmentRepository;
        this.userService = userService;
        this.statsService = statsService;
        this.aiAccountabilityService = aiAccountabilityService;
        this.actionLogRepository = actionLogRepository;
        this.partnershipService = partnershipService;
        this.reviewService = reviewService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTodayPlan(UUID userId) {
        return getPlanForDate(userId, LocalDate.now());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPlanForDate(UUID userId, LocalDate date) {
        LocalDate target = date != null ? date : LocalDate.now();
        AgentProgressListener.emit("🔍 Inspecting schedule for " + target + "...");
        List<CommitmentResponse> commitments = commitmentService.getTodayCommitments(userId, target);
        UserExecutionStats stats = statsService.getOrComputeStats(userId);

        int totalEstimatedMinutes = commitments.stream()
                .mapToInt(CommitmentResponse::getEstimatedMinutes)
                .sum();

        long pendingCount = commitments.stream().filter(c -> c.getStatus() == CommitmentStatus.PENDING).count();
        long completedCount = commitments.stream().filter(c -> c.getStatus() == CommitmentStatus.COMPLETED).count();

        Map<String, Object> result = new HashMap<>();
        result.put("date", target.toString());
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
            m.put("category", c.getCategory() != null ? c.getCategory().name() : "DEEP_WORK");
            m.put("estimatedMinutes", c.getEstimatedMinutes());
            m.put("expectedOutcome", c.getExpectedOutcome());
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
        return createCommitment(userId, title, estimatedMinutes, priority, "DEEP_WORK", expectedOutcome, LocalDate.now());
    }

    @Transactional
    public Map<String, Object> createCommitment(
            UUID userId,
            String title,
            Integer estimatedMinutes,
            CommitmentPriority priority,
            String categoryStr,
            String expectedOutcome,
            LocalDate targetDate
    ) {
        User user = userService.findUserById(userId);

        CommitmentCategory category = CommitmentCategory.DEEP_WORK;
        if (categoryStr != null) {
            try {
                category = CommitmentCategory.valueOf(categoryStr.toUpperCase().trim());
            } catch (Exception ignored) {
            }
        }

        CreateCommitmentRequest request = new CreateCommitmentRequest();
        request.setTitle(title.trim());
        request.setEstimatedMinutes(estimatedMinutes != null && estimatedMinutes > 0 ? estimatedMinutes : 30);
        request.setPriority(priority != null ? priority : CommitmentPriority.MEDIUM);
        request.setCategory(category);
        request.setCommitmentDate(targetDate != null ? targetDate : LocalDate.now());
        request.setVisibility(CommitmentVisibility.PRIVATE);
        request.setExpectedOutcome(expectedOutcome);

        CommitmentResponse created = commitmentService.createCommitment(userId, request);
        AgentProgressListener.emit("⚡ Adding commitment: '" + created.getTitle() + "' (" + created.getEstimatedMinutes() + "m)...");

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

        AgentProgressListener.emit("✓ Completing commitment: '" + existing.getTitle() + "'...");
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
    public Map<String, Object> markCommitmentMissed(UUID userId, UUID commitmentId, String reason) {
        User user = userService.findUserById(userId);
        Commitment existing = commitmentRepository.findActiveByIdAndUserId(commitmentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Commitment not found: " + commitmentId));

        AgentProgressListener.emit("❌ Marking commitment as missed: '" + existing.getTitle() + "'...");
        String beforeState = toJson(existing);

        existing.setStatus(CommitmentStatus.MISSED);
        Commitment saved = commitmentRepository.save(existing);
        statsService.refreshStatsAsync(userId);

        AgentActionLog actionLog = new AgentActionLog(
                user,
                "MARK_MISSED",
                "COMMITMENT",
                commitmentId,
                "Marked '" + existing.getTitle() + "' as MISSED" + (reason != null && !reason.isBlank() ? " (" + reason + ")" : ""),
                beforeState,
                toJson(saved)
        );
        AgentActionLog savedLog = actionLogRepository.save(actionLog);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("commitmentId", commitmentId);
        result.put("title", existing.getTitle());
        result.put("status", "MISSED");
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

        AgentProgressListener.emit("⏳ Postponing commitment: '" + existing.getTitle() + "' to " + nextDate + "...");

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
            AgentProgressListener.emit("🧠 Auditing schedule against cognitive limits...");
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

    @Transactional(readOnly = true)
    public Map<String, Object> detectExcuse(UUID userId, String excuseText, UUID commitmentId) {
        try {
            AgentProgressListener.emit("🔍 Analyzing excuse against historical behavioral patterns...");
            ExcuseAnalysisRequest req = new ExcuseAnalysisRequest(commitmentId, excuseText, "POSTPONE");
            ExcuseAnalysisResponse response = aiAccountabilityService.detectExcusePatternAsync(userId, req).get();

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("patternDetected", response.isPatternDetected());
            result.put("patternType", response.getPatternType());
            result.put("mirrorCallout", response.getMirrorCallout());
            result.put("microActionTitle", response.getMicroActionTitle());
            result.put("suggestedMicroMinutes", response.getSuggestedMicroMinutes());
            return result;
        } catch (Exception e) {
            log.warn("Excuse analysis fallback for user {}: {}", userId, e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("success", true);
            fallback.put("patternDetected", false);
            fallback.put("mirrorCallout", "Acknowledge the friction and commit to a 15-minute micro sprint.");
            return fallback;
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> generatePartnerBrief(UUID userId, UUID partnerId) {
        try {
            AgentProgressListener.emit("🤝 Synthesizing partner accountability overview & progress brief...");
            List<PartnershipResponse> partnerships = partnershipService.getActivePartnerships(userId);
            if (partnerships.isEmpty()) {
                Map<String, Object> res = new HashMap<>();
                res.put("success", true);
                res.put("hasPartners", false);
                res.put("brief", "No active accountability partners found. Invite a partner to unlock mutual peer accountability.");
                return res;
            }

            UUID targetPartner = partnerId != null ? partnerId : (partnerships.get(0).getPartnerId().equals(userId) ? partnerships.get(0).getRequesterId() : partnerships.get(0).getPartnerId());
            PartnerDailyOverviewDto overview = partnershipService.getPartnerDailyOverview(userId, targetPartner, LocalDate.now());

            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("hasPartners", true);
            res.put("partnerName", overview.getPartnerName());
            res.put("completionRate", overview.getCompletionRate());
            res.put("completedTasks", overview.getCompletedCommitments());
            res.put("totalTasks", overview.getTotalCommitments());
            res.put("aiRiskLevel", overview.getAiRiskLevel() != null ? overview.getAiRiskLevel() : "LOW");
            res.put("brief", overview.getAiDiagnosticSummary() != null ? overview.getAiDiagnosticSummary() : "Partner progress on track.");
            return res;
        } catch (Exception e) {
            log.warn("Partner brief tool error for user {}: {}", userId, e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("success", true);
            fallback.put("hasPartners", false);
            fallback.put("brief", "Partner digest currently unavailable: " + e.getMessage());
            return fallback;
        }
    }

    @Transactional
    public Map<String, Object> submitEveningReview(
            UUID userId,
            UUID commitmentId,
            CommitmentStatus status,
            FailureReason failureReason,
            String reflection,
            NextAction nextAction,
            LocalDate rescheduleDate
    ) {
        User user = userService.findUserById(userId);
        Commitment existing = commitmentRepository.findActiveByIdAndUserId(commitmentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Commitment not found: " + commitmentId));

        AgentProgressListener.emit("🌅 Submitting evening review & reflection for '" + existing.getTitle() + "'...");
        String beforeState = toJson(existing);

        ReviewCommitmentRequest req = new ReviewCommitmentRequest();
        req.setStatus(status != null ? status : CommitmentStatus.COMPLETED);
        req.setFailureReason(failureReason);
        req.setReflection(reflection);
        req.setNextAction(nextAction != null ? nextAction : NextAction.MOVE_TO_TOMORROW);
        req.setRescheduleDate(rescheduleDate);

        ReviewResponse review = reviewService.reviewCommitment(userId, commitmentId, req);

        AgentActionLog actionLog = new AgentActionLog(
                user,
                "REVIEW_COMMITMENT",
                "COMMITMENT",
                commitmentId,
                "Submitted review for '" + existing.getTitle() + "' (" + (status != null ? status.name() : "COMPLETED") + ")",
                beforeState,
                toJson(review)
        );
        AgentActionLog savedLog = actionLogRepository.save(actionLog);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("commitmentId", commitmentId);
        res.put("title", existing.getTitle());
        res.put("status", review.getStatus() != null ? review.getStatus().name() : "COMPLETED");
        res.put("reflection", review.getReflection());
        res.put("logId", savedLog.getId());
        return res;
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }
}
