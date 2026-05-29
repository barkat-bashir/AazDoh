package com.aazdoh.analytics.controller;

import com.aazdoh.analytics.dto.AccountabilityStatsResponse;
import com.aazdoh.analytics.service.AnalyticsService;
import com.aazdoh.auth.service.CustomUserDetails;
import com.aazdoh.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@Tag(name = "Analytics", description = "Behavioral velocity, failure breakdown, and completion statistics")
@SecurityRequirement(name = "BearerAuth")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get behavioral accountability metrics for a given time window (e.g. 7, 30 days)")
    public ResponseEntity<ApiResponse<AccountabilityStatsResponse>> getSummary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(name = "days", defaultValue = "30") int days
    ) {
        AccountabilityStatsResponse response = analyticsService.getAccountabilitySummary(userDetails.getId(), days);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
