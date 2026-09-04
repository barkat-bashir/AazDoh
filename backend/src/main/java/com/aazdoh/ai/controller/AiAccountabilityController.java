package com.aazdoh.ai.controller;

import com.aazdoh.ai.dto.AiFeedbackResponse;
import com.aazdoh.ai.dto.AiMissedReviewRequest;
import com.aazdoh.ai.dto.AiPlanReviewRequest;
import com.aazdoh.ai.dto.ApplyOptimizedPlanRequest;
import com.aazdoh.ai.dto.ExcuseAnalysisRequest;
import com.aazdoh.ai.dto.ExcuseAnalysisResponse;
import com.aazdoh.ai.dto.PlanStressTestRequest;
import com.aazdoh.ai.dto.PlanStressTestResponse;
import com.aazdoh.ai.service.AiAccountabilityService;
import com.aazdoh.auth.service.CustomUserDetails;
import com.aazdoh.commitment.dto.CommitmentResponse;
import com.aazdoh.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/v1/ai")
@Tag(name = "AI Accountability", description = "AI Agent endpoints for plan feasibility, failure deconstruction, and behavioral patterns")
@SecurityRequirement(name = "BearerAuth")
public class AiAccountabilityController {

    private final AiAccountabilityService aiAccountabilityService;

    public AiAccountabilityController(AiAccountabilityService aiAccountabilityService) {
        this.aiAccountabilityService = aiAccountabilityService;
    }

    @PostMapping("/review-plan")
    @Operation(summary = "Ask the AI agent to review today's commitment plan feasibility against 7-day velocity (Async non-blocking)")
    public CompletableFuture<ResponseEntity<ApiResponse<AiFeedbackResponse>>> reviewPlan(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody(required = false) AiPlanReviewRequest request
    ) {
        return aiAccountabilityService.reviewDailyPlanAsync(
                userDetails.getId(),
                request != null ? request.getDate() : null
        ).thenApply(response -> ResponseEntity.ok(ApiResponse.ok(response)));
    }

    @PostMapping("/review-missed")
    @Operation(summary = "Ask the AI agent to analyze a missed commitment and suggest tomorrow's adjustment (Async non-blocking)")
    public CompletableFuture<ResponseEntity<ApiResponse<AiFeedbackResponse>>> reviewMissed(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AiMissedReviewRequest request
    ) {
        return aiAccountabilityService.reviewMissedCommitmentAsync(
                userDetails.getId(),
                request.getCommitmentId()
        ).thenApply(response -> ResponseEntity.ok(ApiResponse.ok(response)));
    }

    @GetMapping("/insights")
    @Operation(summary = "Get synthesized AI behavioral patterns and recommendations (Cached async)")
    public CompletableFuture<ResponseEntity<ApiResponse<AiFeedbackResponse>>> getInsights(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return aiAccountabilityService.getBehavioralInsightsAsync(userDetails.getId())
                .thenApply(response -> ResponseEntity.ok(ApiResponse.ok(response)));
    }

    @PostMapping("/stress-test")
    @Operation(summary = "AI Chief of Staff 60-Second Plan Stress-Test with Risk Index & De-risked Proposals")
    public CompletableFuture<ResponseEntity<ApiResponse<PlanStressTestResponse>>> stressTestPlan(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody(required = false) PlanStressTestRequest request
    ) {
        return aiAccountabilityService.stressTestPlanAsync(userDetails.getId(), request)
                .thenApply(response -> ResponseEntity.ok(ApiResponse.ok(response)));
    }

    @PostMapping("/apply-optimized-plan")
    @Operation(summary = "Apply 1-click AI optimized plan rebalancing adjustments to today's commitments")
    public ResponseEntity<ApiResponse<List<CommitmentResponse>>> applyOptimizedPlan(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ApplyOptimizedPlanRequest request
    ) {
        List<CommitmentResponse> updated = aiAccountabilityService.applyOptimizedPlan(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Optimized plan applied successfully", updated));
    }

    @PostMapping("/detect-excuse")
    @Operation(summary = "AI Anti-Self-Deception Mirror: Cross-reference excuses against historical receipts")
    public CompletableFuture<ResponseEntity<ApiResponse<ExcuseAnalysisResponse>>> detectExcuse(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ExcuseAnalysisRequest request
    ) {
        return aiAccountabilityService.detectExcusePatternAsync(userDetails.getId(), request)
                .thenApply(response -> ResponseEntity.ok(ApiResponse.ok(response)));
    }
}
