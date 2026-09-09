package com.aazdoh.ai.config;

import com.aazdoh.ai.agent.AgentTools;
import com.aazdoh.auth.service.CustomUserDetails;
import com.aazdoh.commitment.entity.CommitmentPriority;
import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.review.entity.FailureReason;
import com.aazdoh.review.entity.NextAction;
import com.fasterxml.jackson.annotation.JsonClassDescription;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Configuration
public class AgentFunctionConfig {

    private static final Logger log = LoggerFactory.getLogger(AgentFunctionConfig.class);

    private UUID getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userDetails.getId();
        }
        throw new IllegalStateException("User must be authenticated to invoke agent tools");
    }

    // --- 1. Create Commitment Function ---
    @JsonClassDescription("Request to create a new daily commitment")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record CreateCommitmentFunctionRequest(
            @JsonProperty(required = true) @JsonPropertyDescription("Title of the commitment (e.g. 'Solve 1 Leetcode Problem', 'Tahajjud Prayers')") String title,
            @JsonPropertyDescription("Estimated duration in minutes (e.g. 15, 30, 45, 60)") Integer estimatedMinutes,
            @JsonPropertyDescription("Priority level: URGENT, HIGH, MEDIUM, LOW. Default: MEDIUM") String priority,
            @JsonPropertyDescription("Category: ROUTINE, DEEP_WORK, LEARNING, FITNESS_HEALTH, COMMUNICATION. Default: DEEP_WORK") String category,
            @JsonPropertyDescription("Definition of done or expected outcome") String expectedOutcome,
            @JsonPropertyDescription("Target date (YYYY-MM-DD). Defaults to today") String targetDate
    ) {}

    public record CreateCommitmentFunctionResponse(boolean success, UUID commitmentId, String title, int estimatedMinutes, String message) {}

    @Bean
    @Description("Create a new daily commitment for the user with title, estimated minutes, priority, category, and definition of done")
    public Function<CreateCommitmentFunctionRequest, CreateCommitmentFunctionResponse> createCommitmentFunction(AgentTools agentTools) {
        return request -> {
            try {
                UUID userId = getAuthenticatedUserId();
                CommitmentPriority prio = CommitmentPriority.MEDIUM;
                if (request.priority() != null) {
                    try { prio = CommitmentPriority.valueOf(request.priority().toUpperCase().trim()); } catch (Exception ignored) {}
                }
                LocalDate date = LocalDate.now();
                if (request.targetDate() != null && !request.targetDate().isBlank()) {
                    try { date = LocalDate.parse(request.targetDate().trim()); } catch (Exception ignored) {}
                }

                Map<String, Object> result = agentTools.createCommitment(
                        userId,
                        request.title(),
                        request.estimatedMinutes() != null ? request.estimatedMinutes() : 30,
                        prio,
                        request.category() != null ? request.category() : "DEEP_WORK",
                        request.expectedOutcome(),
                        date
                );

                return new CreateCommitmentFunctionResponse(
                        true,
                        (UUID) result.get("commitmentId"),
                        (String) result.get("title"),
                        (int) result.get("estimatedMinutes"),
                        "Commitment created successfully."
                );
            } catch (Exception e) {
                log.error("Error in createCommitmentFunction: {}", e.getMessage());
                return new CreateCommitmentFunctionResponse(false, null, request.title(), 0, "Failed: " + e.getMessage());
            }
        };
    }

    // --- 2. Get Plan Function ---
    @JsonClassDescription("Request to retrieve commitment schedule for a specific date")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record GetPlanFunctionRequest(
            @JsonPropertyDescription("Date in YYYY-MM-DD format (e.g. today or yesterday). If omitted, defaults to today.") String targetDate
    ) {}

    public record GetPlanFunctionResponse(boolean success, String date, int totalCommitments, long pendingCommitments, long completedCommitments, int totalEstimatedMinutes, String capacityStatus, List<Map<String, Object>> commitments) {}

    @SuppressWarnings("unchecked")
    @Bean
    @Description("Get the user's daily commitment schedule, progress, and cognitive load for a specific date (today, yesterday, or any YYYY-MM-DD)")
    public Function<GetPlanFunctionRequest, GetPlanFunctionResponse> getPlanFunction(AgentTools agentTools) {
        return request -> {
            try {
                UUID userId = getAuthenticatedUserId();
                LocalDate date = LocalDate.now();
                if (request != null && request.targetDate() != null && !request.targetDate().isBlank()) {
                    try { date = LocalDate.parse(request.targetDate().trim()); } catch (Exception ignored) {}
                }

                Map<String, Object> plan = agentTools.getPlanForDate(userId, date);
                return new GetPlanFunctionResponse(
                        true,
                        (String) plan.get("date"),
                        (int) plan.get("totalCommitments"),
                        (long) plan.get("pendingCommitments"),
                        (long) plan.get("completedCommitments"),
                        (int) plan.get("totalEstimatedMinutes"),
                        (String) plan.get("capacityStatus"),
                        (List<Map<String, Object>>) plan.get("commitments")
                );
            } catch (Exception e) {
                log.error("Error in getPlanFunction: {}", e.getMessage());
                return new GetPlanFunctionResponse(false, LocalDate.now().toString(), 0, 0, 0, 0, "ERROR", List.of());
            }
        };
    }

    // --- 3. Postpone Commitment Function ---
    @JsonClassDescription("Request to postpone a commitment to a future date")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record PostponeCommitmentFunctionRequest(
            @JsonProperty(required = true) @JsonPropertyDescription("UUID ID of the commitment to postpone") String commitmentId,
            @JsonPropertyDescription("Reason for postponement") String reason,
            @JsonPropertyDescription("Target date (YYYY-MM-DD). Defaults to tomorrow") String newDate
    ) {}

    public record PostponeCommitmentFunctionResponse(boolean success, UUID commitmentId, String title, String newDate, String message) {}

    @Bean
    @Description("Postpone a commitment to a future date with an audited reason")
    public Function<PostponeCommitmentFunctionRequest, PostponeCommitmentFunctionResponse> postponeCommitmentFunction(AgentTools agentTools) {
        return request -> {
            try {
                UUID userId = getAuthenticatedUserId();
                UUID cid = UUID.fromString(request.commitmentId().trim());
                LocalDate newDate = LocalDate.now().plusDays(1);
                if (request.newDate() != null && !request.newDate().isBlank()) {
                    try { newDate = LocalDate.parse(request.newDate().trim()); } catch (Exception ignored) {}
                }

                Map<String, Object> result = agentTools.postponeCommitment(userId, cid, request.reason(), newDate);
                return new PostponeCommitmentFunctionResponse(
                        true,
                        (UUID) result.get("commitmentId"),
                        (String) result.get("title"),
                        (String) result.get("newDate"),
                        "Commitment postponed successfully."
                );
            } catch (Exception e) {
                log.error("Error in postponeCommitmentFunction: {}", e.getMessage());
                return new PostponeCommitmentFunctionResponse(false, null, null, null, "Failed: " + e.getMessage());
            }
        };
    }

    // --- 4. Complete Commitment Function ---
    @JsonClassDescription("Request to mark a commitment as completed")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record CompleteCommitmentFunctionRequest(
            @JsonProperty(required = true) @JsonPropertyDescription("UUID ID of the commitment to mark complete") String commitmentId
    ) {}

    public record CompleteCommitmentFunctionResponse(boolean success, UUID commitmentId, String title, String message) {}

    @Bean
    @Description("Mark a commitment as completed and update streaks")
    public Function<CompleteCommitmentFunctionRequest, CompleteCommitmentFunctionResponse> completeCommitmentFunction(AgentTools agentTools) {
        return request -> {
            try {
                UUID userId = getAuthenticatedUserId();
                UUID cid = UUID.fromString(request.commitmentId().trim());
                Map<String, Object> result = agentTools.completeCommitment(userId, cid);
                return new CompleteCommitmentFunctionResponse(
                        true,
                        (UUID) result.get("commitmentId"),
                        (String) result.get("title"),
                        "Commitment completed successfully."
                );
            } catch (Exception e) {
                log.error("Error in completeCommitmentFunction: {}", e.getMessage());
                return new CompleteCommitmentFunctionResponse(false, null, null, "Failed: " + e.getMessage());
            }
        };
    }

    // --- 5. Stress Test Schedule Function ---
    @JsonClassDescription("Request to run cognitive load stress test on schedule")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record StressTestFunctionRequest(
            @JsonPropertyDescription("Optional defense or context for high load") String quickDefense
    ) {}

    public record StressTestFunctionResponse(boolean success, int riskScore, String riskLevel, String diagnosticSummary) {}

    @Bean
    @Description("Run cognitive capacity stress-test on today's schedule to diagnose bottlenecks")
    public Function<StressTestFunctionRequest, StressTestFunctionResponse> stressTestScheduleFunction(AgentTools agentTools) {
        return request -> {
            try {
                UUID userId = getAuthenticatedUserId();
                String defense = request != null ? request.quickDefense() : null;
                Map<String, Object> result = agentTools.stressTestSchedule(userId, defense);
                return new StressTestFunctionResponse(
                        true,
                        (int) result.getOrDefault("riskScore", 25),
                        (String) result.getOrDefault("riskLevel", "LOW"),
                        (String) result.getOrDefault("diagnosticSummary", "Schedule reviewed.")
                );
            } catch (Exception e) {
                log.error("Error in stressTestScheduleFunction: {}", e.getMessage());
                return new StressTestFunctionResponse(false, 0, "LOW", "Failed: " + e.getMessage());
            }
        };
    }

    // --- 6. Detect Excuse Function ---
    @JsonClassDescription("Request to analyze an excuse or explanation for postponing or missing a commitment")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record DetectExcuseFunctionRequest(
            @JsonProperty(required = true) @JsonPropertyDescription("The stated explanation, rationalization, or excuse") String excuseText,
            @JsonPropertyDescription("Optional UUID of the relevant commitment") String commitmentId
    ) {}

    public record DetectExcuseFunctionResponse(boolean success, boolean patternDetected, String patternType, String mirrorCallout, String microActionTitle, int suggestedMicroMinutes) {}

    @Bean
    @Description("Analyze a stated reason/excuse for missing or postponing work to identify avoidance patterns and micro actions")
    public Function<DetectExcuseFunctionRequest, DetectExcuseFunctionResponse> detectExcuseFunction(AgentTools agentTools) {
        return request -> {
            try {
                UUID userId = getAuthenticatedUserId();
                UUID cid = null;
                if (request.commitmentId() != null && !request.commitmentId().isBlank()) {
                    try { cid = UUID.fromString(request.commitmentId().trim()); } catch (Exception ignored) {}
                }
                Map<String, Object> result = agentTools.detectExcuse(userId, request.excuseText(), cid);
                return new DetectExcuseFunctionResponse(
                        true,
                        (boolean) result.getOrDefault("patternDetected", false),
                        (String) result.getOrDefault("patternType", "NO_PATTERN"),
                        (String) result.getOrDefault("mirrorCallout", "Acknowledge friction."),
                        (String) result.getOrDefault("microActionTitle", "Take immediate 15m micro action"),
                        (int) result.getOrDefault("suggestedMicroMinutes", 15)
                );
            } catch (Exception e) {
                log.error("Error in detectExcuseFunction: {}", e.getMessage());
                return new DetectExcuseFunctionResponse(false, false, "ERROR", "Analysis unavailable: " + e.getMessage(), "Start 15m sprint", 15);
            }
        };
    }

    // --- 7. Generate Partner Brief Function ---
    @JsonClassDescription("Request to generate a concise progress digest for accountability partners")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record GeneratePartnerBriefFunctionRequest(
            @JsonPropertyDescription("Optional UUID of a specific accountability partner") String partnerId
    ) {}

    public record GeneratePartnerBriefFunctionResponse(boolean success, boolean hasPartners, String partnerName, double completionRate, int completedTasks, int pendingTasks, int missedTasks, String brief) {}

    @Bean
    @Description("Generate an objective peer accountability progress brief for accountability partners")
    public Function<GeneratePartnerBriefFunctionRequest, GeneratePartnerBriefFunctionResponse> generatePartnerBriefFunction(AgentTools agentTools) {
        return request -> {
            try {
                UUID userId = getAuthenticatedUserId();
                UUID pid = null;
                if (request != null && request.partnerId() != null && !request.partnerId().isBlank()) {
                    try { pid = UUID.fromString(request.partnerId().trim()); } catch (Exception ignored) {}
                }
                Map<String, Object> result = agentTools.generatePartnerBrief(userId, pid);
                return new GeneratePartnerBriefFunctionResponse(
                        true,
                        (boolean) result.getOrDefault("hasPartners", false),
                        (String) result.getOrDefault("partnerName", "Partner"),
                        result.get("completionRate") instanceof Number n ? n.doubleValue() : 0.0,
                        result.get("completedTasks") instanceof Number n ? n.intValue() : 0,
                        result.get("pendingTasks") instanceof Number n ? n.intValue() : 0,
                        result.get("missedTasks") instanceof Number n ? n.intValue() : 0,
                        (String) result.getOrDefault("brief", "No partner updates available.")
                );
            } catch (Exception e) {
                log.error("Error in generatePartnerBriefFunction: {}", e.getMessage());
                return new GeneratePartnerBriefFunctionResponse(false, false, "Partner", 0.0, 0, 0, 0, "Failed: " + e.getMessage());
            }
        };
    }

    // --- 8. Submit Evening Review Function ---
    @JsonClassDescription("Request to record an end-of-day retrospective review for a commitment")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record SubmitEveningReviewFunctionRequest(
            @JsonProperty(required = true) @JsonPropertyDescription("UUID of the commitment being reviewed") String commitmentId,
            @JsonPropertyDescription("Status: COMPLETED, MISSED, PARTIALLY_COMPLETED. Default: COMPLETED") String status,
            @JsonPropertyDescription("Root cause failure reason if missed: FORGOT, UNDERESTIMATED_EFFORT, DISTRACTED, BLOCKED, LOW_ENERGY, PROCRASTINATION, UNEXPECTED_EMERGENCY, DIDNT_PRIORITIZE, OTHER") String failureReason,
            @JsonPropertyDescription("Retrospective self-reflection notes") String reflection,
            @JsonPropertyDescription("Next action: MOVE_TO_TOMORROW, RESCHEDULE, BREAK_DOWN, DROP, NONE") String nextAction,
            @JsonPropertyDescription("Reschedule date (YYYY-MM-DD) if moving to a specific date") String rescheduleDate
    ) {}

    public record SubmitEveningReviewFunctionResponse(boolean success, UUID commitmentId, String title, String status, String reflection, String message) {}

    @Bean
    @Description("Submit end-of-day retrospective review, classify root causes of missed tasks, and record reflection")
    public Function<SubmitEveningReviewFunctionRequest, SubmitEveningReviewFunctionResponse> submitEveningReviewFunction(AgentTools agentTools) {
        return request -> {
            try {
                UUID userId = getAuthenticatedUserId();
                UUID cid = UUID.fromString(request.commitmentId().trim());

                CommitmentStatus status = CommitmentStatus.COMPLETED;
                if (request.status() != null) {
                    try { status = CommitmentStatus.valueOf(request.status().toUpperCase().trim()); } catch (Exception ignored) {}
                }

                FailureReason reason = null;
                if (request.failureReason() != null) {
                    try { reason = FailureReason.valueOf(request.failureReason().toUpperCase().trim()); } catch (Exception ignored) {}
                }

                NextAction nextAction = NextAction.MOVE_TO_TOMORROW;
                if (request.nextAction() != null) {
                    try { nextAction = NextAction.valueOf(request.nextAction().toUpperCase().trim()); } catch (Exception ignored) {}
                }

                LocalDate reschedDate = null;
                if (request.rescheduleDate() != null && !request.rescheduleDate().isBlank()) {
                    try { reschedDate = LocalDate.parse(request.rescheduleDate().trim()); } catch (Exception ignored) {}
                }

                Map<String, Object> result = agentTools.submitEveningReview(userId, cid, status, reason, request.reflection(), nextAction, reschedDate);
                return new SubmitEveningReviewFunctionResponse(
                        true,
                        (UUID) result.get("commitmentId"),
                        (String) result.get("title"),
                        (String) result.get("status"),
                        (String) result.get("reflection"),
                        "Evening review recorded successfully."
                );
            } catch (Exception e) {
                log.error("Error in submitEveningReviewFunction: {}", e.getMessage());
                return new SubmitEveningReviewFunctionResponse(false, null, null, null, null, "Failed: " + e.getMessage());
            }
        };
    }
}
