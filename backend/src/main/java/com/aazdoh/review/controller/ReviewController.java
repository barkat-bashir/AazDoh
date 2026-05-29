package com.aazdoh.review.controller;

import com.aazdoh.auth.service.CustomUserDetails;
import com.aazdoh.common.response.ApiResponse;
import com.aazdoh.review.dto.ReviewCommitmentRequest;
import com.aazdoh.review.dto.ReviewResponse;
import com.aazdoh.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/commitments/{commitmentId}/review")
@Tag(name = "Daily Reviews", description = "Endpoints for end-of-day commitment reviews, failure explanations, and reflections")
@SecurityRequirement(name = "BearerAuth")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    @Operation(summary = "Submit end-of-day review and reflection for a commitment")
    public ResponseEntity<ApiResponse<ReviewResponse>> reviewCommitment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("commitmentId") UUID commitmentId,
            @Valid @RequestBody ReviewCommitmentRequest request
    ) {
        ReviewResponse response = reviewService.reviewCommitment(userDetails.getId(), commitmentId, request);
        return ResponseEntity.ok(ApiResponse.ok("Review submitted successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get review details for a commitment")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReview(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("commitmentId") UUID commitmentId
    ) {
        ReviewResponse response = reviewService.getReviewByCommitmentId(userDetails.getId(), commitmentId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
