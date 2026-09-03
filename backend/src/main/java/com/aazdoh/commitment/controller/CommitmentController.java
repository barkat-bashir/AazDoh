package com.aazdoh.commitment.controller;

import com.aazdoh.auth.service.CustomUserDetails;
import com.aazdoh.commitment.dto.CommitmentResponse;
import com.aazdoh.commitment.dto.CreateCommitmentRequest;
import com.aazdoh.commitment.dto.PostponeCommitmentRequest;
import com.aazdoh.commitment.dto.UpdateCommitmentRequest;
import com.aazdoh.commitment.service.CommitmentService;
import com.aazdoh.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/commitments")
@Tag(name = "Commitments", description = "Endpoints for creating and managing daily commitments")
@SecurityRequirement(name = "BearerAuth")
public class CommitmentController {

    private final CommitmentService commitmentService;

    public CommitmentController(CommitmentService commitmentService) {
        this.commitmentService = commitmentService;
    }

    @PostMapping
    @Operation(summary = "Create a new daily commitment")
    public ResponseEntity<ApiResponse<CommitmentResponse>> createCommitment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateCommitmentRequest request
    ) {
        CommitmentResponse response = commitmentService.createCommitment(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Commitment created successfully", response));
    }

    @GetMapping("/today")
    @Operation(summary = "Get commitments for today or specified date")
    public ResponseEntity<ApiResponse<List<CommitmentResponse>>> getTodayCommitments(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<CommitmentResponse> list = commitmentService.getTodayCommitments(userDetails.getId(), targetDate);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/range")
    @Operation(summary = "Get commitments within a date range")
    public ResponseEntity<ApiResponse<List<CommitmentResponse>>> getCommitmentsByRange(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        List<CommitmentResponse> list = commitmentService.getCommitmentsByRange(userDetails.getId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get commitment details by ID")
    public ResponseEntity<ApiResponse<CommitmentResponse>> getCommitmentById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID id
    ) {
        CommitmentResponse response = commitmentService.getCommitmentById(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update an existing commitment")
    public ResponseEntity<ApiResponse<CommitmentResponse>> updateCommitment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateCommitmentRequest request
    ) {
        CommitmentResponse response = commitmentService.updateCommitment(userDetails.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Commitment updated successfully", response));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Mark a commitment as completed")
    public ResponseEntity<ApiResponse<CommitmentResponse>> completeCommitment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID id
    ) {
        CommitmentResponse response = commitmentService.completeCommitment(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Commitment marked as completed", response));
    }

    @PostMapping("/{id}/reopen")
    @Operation(summary = "Reopen a postponed commitment back to pending active state")
    public ResponseEntity<ApiResponse<CommitmentResponse>> reopenCommitment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID id
    ) {
        CommitmentResponse response = commitmentService.reopenCommitment(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Commitment reopened for today", response));
    }

    @PostMapping("/{id}/postpone")
    @Operation(summary = "Postpone a commitment to a future date")
    public ResponseEntity<ApiResponse<CommitmentResponse>> postponeCommitment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID id,
            @Valid @RequestBody PostponeCommitmentRequest request
    ) {
        CommitmentResponse response = commitmentService.postponeCommitment(userDetails.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Commitment postponed successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete a commitment")
    public ResponseEntity<ApiResponse<Void>> deleteCommitment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID id
    ) {
        commitmentService.deleteCommitment(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Commitment deleted successfully", null));
    }
}
