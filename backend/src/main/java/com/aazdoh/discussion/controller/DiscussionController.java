package com.aazdoh.discussion.controller;

import com.aazdoh.auth.service.CustomUserDetails;
import com.aazdoh.common.response.ApiResponse;
import com.aazdoh.discussion.dto.AddMessageRequest;
import com.aazdoh.discussion.dto.DiscussionMessageDto;
import com.aazdoh.discussion.dto.DiscussionResponse;
import com.aazdoh.discussion.service.DiscussionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/api/v1/commitments/{commitmentId}/discussion")
@Tag(name = "Discussions", description = "Endpoints for discussing commitments with accountability partners")
@SecurityRequirement(name = "BearerAuth")
public class DiscussionController {

    private final DiscussionService discussionService;

    public DiscussionController(DiscussionService discussionService) {
        this.discussionService = discussionService;
    }

    @GetMapping
    @Operation(summary = "Get full discussion thread for a commitment")
    public ResponseEntity<ApiResponse<DiscussionResponse>> getDiscussion(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("commitmentId") UUID commitmentId
    ) {
        UUID currentUserId = userDetails != null ? userDetails.getId() : null;
        DiscussionResponse response = discussionService.getOrCreateDiscussion(commitmentId, currentUserId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/messages")
    @Operation(summary = "Post a new question or response message on a commitment thread")
    public ResponseEntity<ApiResponse<DiscussionMessageDto>> postMessage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable("commitmentId") UUID commitmentId,
            @Valid @RequestBody AddMessageRequest request
    ) {
        DiscussionMessageDto response = discussionService.addMessage(userDetails.getId(), commitmentId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Message posted successfully", response));
    }
}
