package com.aazdoh.analytics.controller;

import com.aazdoh.analytics.dto.FocusSprintAnalyticsResponse;
import com.aazdoh.analytics.dto.RecordFocusSprintRequest;
import com.aazdoh.analytics.entity.FocusSprint;
import com.aazdoh.analytics.service.FocusSprintService;
import com.aazdoh.auth.service.CustomUserDetails;
import com.aazdoh.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/focus")
@Tag(name = "Focus Sprint Telemetry", description = "Endpoints for logging Pomodoro focus sessions and analyzing execution stamina")
@SecurityRequirement(name = "BearerAuth")
public class FocusSprintController {

    private final FocusSprintService focusSprintService;

    public FocusSprintController(FocusSprintService focusSprintService) {
        this.focusSprintService = focusSprintService;
    }

    @PostMapping("/record")
    @Operation(summary = "Record a completed or finished focus sprint with telemetry and parked distractions")
    public ResponseEntity<ApiResponse<FocusSprint>> recordSprint(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody RecordFocusSprintRequest request
    ) {
        FocusSprint sprint = focusSprintService.recordSprint(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok(sprint));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get deep-dive focus sprint telemetry, actual vs estimated accuracy, distraction density, and fatigue curve")
    public ResponseEntity<ApiResponse<FocusSprintAnalyticsResponse>> getAnalytics(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(name = "days", defaultValue = "30") int days
    ) {
        FocusSprintAnalyticsResponse response = focusSprintService.getFocusSprintAnalytics(userDetails.getId(), days);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
