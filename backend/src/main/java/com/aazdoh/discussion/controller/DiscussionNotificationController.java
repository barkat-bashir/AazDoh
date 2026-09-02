package com.aazdoh.discussion.controller;

import com.aazdoh.auth.service.CustomUserDetails;
import com.aazdoh.common.response.ApiResponse;
import com.aazdoh.discussion.dto.UnreadSummaryDto;
import com.aazdoh.discussion.service.DiscussionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/discussions")
@Tag(name = "Discussion Notifications", description = "Endpoints for unread discussion messages and partner alerts")
@SecurityRequirement(name = "BearerAuth")
public class DiscussionNotificationController {

    private final DiscussionService discussionService;

    public DiscussionNotificationController(DiscussionService discussionService) {
        this.discussionService = discussionService;
    }

    @GetMapping("/unread-summary")
    @Operation(summary = "Get unread discussion messages and pending partner requests count")
    public ResponseEntity<ApiResponse<UnreadSummaryDto>> getUnreadSummary(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        UnreadSummaryDto summary = discussionService.getUnreadSummary(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }
}
