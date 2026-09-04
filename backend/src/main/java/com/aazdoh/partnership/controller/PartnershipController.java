package com.aazdoh.partnership.controller;

import com.aazdoh.auth.service.CustomUserDetails;
import com.aazdoh.common.response.ApiResponse;
import com.aazdoh.partnership.dto.AcceptPartnershipRequest;
import com.aazdoh.partnership.dto.InvitePartnerRequest;
import com.aazdoh.partnership.dto.PartnerDailyOverviewDto;
import com.aazdoh.partnership.dto.PartnershipResponse;
import com.aazdoh.partnership.service.PartnershipService;
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
@RequestMapping("/api/v1/partnerships")
@Tag(name = "Partnerships", description = "Endpoints for managing 1-to-1 peer accountability partnerships")
@SecurityRequirement(name = "BearerAuth")
public class PartnershipController {

    private final PartnershipService partnershipService;

    public PartnershipController(PartnershipService partnershipService) {
        this.partnershipService = partnershipService;
    }

    @PostMapping("/invite")
    @Operation(summary = "Send an accountability partnership invitation by email")
    public ResponseEntity<ApiResponse<PartnershipResponse>> invitePartner(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody InvitePartnerRequest request
    ) {
        PartnershipResponse response = partnershipService.invitePartner(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Partnership invitation sent", response));
    }

    @PostMapping("/{id}/accept")
    @Operation(summary = "Accept an incoming partnership invitation")
    public ResponseEntity<ApiResponse<PartnershipResponse>> acceptInvitation(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID partnershipId,
            @RequestBody(required = false) AcceptPartnershipRequest request
    ) {
        PartnershipResponse response = partnershipService.acceptInvitation(userDetails.getId(), partnershipId, request);
        return ResponseEntity.ok(ApiResponse.ok("Partnership accepted", response));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject an incoming partnership invitation")
    public ResponseEntity<ApiResponse<PartnershipResponse>> rejectInvitation(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID partnershipId
    ) {
        PartnershipResponse response = partnershipService.rejectInvitation(userDetails.getId(), partnershipId);
        return ResponseEntity.ok(ApiResponse.ok("Partnership rejected", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Terminate an active partnership")
    public ResponseEntity<ApiResponse<Void>> terminatePartnership(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("id") UUID partnershipId
    ) {
        partnershipService.terminatePartnership(userDetails.getId(), partnershipId);
        return ResponseEntity.ok(ApiResponse.ok("Partnership terminated", null));
    }

    @GetMapping
    @Operation(summary = "Get list of active accountability partners")
    public ResponseEntity<ApiResponse<List<PartnershipResponse>>> getActivePartners(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<PartnershipResponse> list = partnershipService.getActivePartnerships(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/invitations/incoming")
    @Operation(summary = "Get pending incoming partnership invitations")
    public ResponseEntity<ApiResponse<List<PartnershipResponse>>> getIncomingInvitations(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<PartnershipResponse> list = partnershipService.getPendingIncomingInvitations(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/invitations/outgoing")
    @Operation(summary = "Get pending outgoing partnership invitations")
    public ResponseEntity<ApiResponse<List<PartnershipResponse>>> getOutgoingInvitations(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<PartnershipResponse> list = partnershipService.getPendingOutgoingInvitations(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/partner/{partnerUserId}/commitments")
    @Operation(summary = "View an active partner's shared commitments for a specific date")
    public ResponseEntity<ApiResponse<PartnerDailyOverviewDto>> getPartnerDailyCommitments(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("partnerUserId") UUID partnerUserId,
            @RequestParam(name = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        PartnerDailyOverviewDto overview = partnershipService.getPartnerDailyOverview(userDetails.getId(), partnerUserId, date);
        return ResponseEntity.ok(ApiResponse.ok(overview));
    }
}
