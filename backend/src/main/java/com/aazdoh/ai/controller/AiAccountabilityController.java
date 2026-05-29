package com.aazdoh.ai.controller;

import com.aazdoh.ai.dto.AiFeedbackResponse;
import com.aazdoh.ai.dto.AiMissedReviewRequest;
import com.aazdoh.ai.dto.AiPlanReviewRequest;
import com.aazdoh.ai.service.AiAccountabilityService;
import com.aazdoh.auth.service.CustomUserDetails;
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
    @Operation(summary = "Ask the AI agent to review today's commitment plan feasibility against 7-day velocity")
    public ResponseEntity<ApiResponse<AiFeedbackResponse>> reviewPlan(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody(required = false) AiPlanReviewRequest request
    ) {
        AiFeedbackResponse response = aiAccountabilityService.reviewDailyPlan(
                userDetails.getId(),
                request != null ? request.getDate() : null
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/review-missed")
    @Operation(summary = "Ask the AI agent to analyze a missed commitment and suggest tomorrow's adjustment")
    public ResponseEntity<ApiResponse<AiFeedbackResponse>> reviewMissed(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AiMissedReviewRequest request
    ) {
        AiFeedbackResponse response = aiAccountabilityService.reviewMissedCommitment(
                userDetails.getId(),
                request.getCommitmentId()
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/insights")
    @Operation(summary = "Get synthesized AI behavioral patterns and recommendations")
    public ResponseEntity<ApiResponse<AiFeedbackResponse>> getInsights(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        AiFeedbackResponse response = aiAccountabilityService.getBehavioralInsights(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
