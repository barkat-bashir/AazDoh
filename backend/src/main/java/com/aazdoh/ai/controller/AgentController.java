package com.aazdoh.ai.controller;

import com.aazdoh.ai.dto.AgentActionReceipt;
import com.aazdoh.ai.dto.AgentChatRequest;
import com.aazdoh.ai.dto.AgentChatResponse;
import com.aazdoh.ai.service.AgentChatService;
import com.aazdoh.auth.service.CustomUserDetails;
import com.aazdoh.common.response.ApiResponse;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agent")
@Tag(name = "Agent", description = "Autonomous In-App AI Accountability Agent & Tool Calling")
@SecurityRequirement(name = "BearerAuth")
public class AgentController {

    private final AgentChatService agentChatService;

    public AgentController(AgentChatService agentChatService) {
        this.agentChatService = agentChatService;
    }

    @PostMapping(value = "/chat/stream", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream agent execution steps and real-time response via Server-Sent Events (SSE)")
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter chatStream(
            @Valid @RequestBody AgentChatRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return agentChatService.chatStream(userDetails.getId(), request);
    }

    @PostMapping("/chat")
    @Operation(summary = "Send a message to the autonomous AI accountability agent")
    public ResponseEntity<ApiResponse<AgentChatResponse>> chat(
            @Valid @RequestBody AgentChatRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        AgentChatResponse response = agentChatService.chat(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Agent response generated successfully", response));
    }

    @PostMapping("/undo")
    @Operation(summary = "Undo the most recent agent mutation")
    public ResponseEntity<ApiResponse<AgentActionReceipt>> undoLastAction(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        AgentActionReceipt receipt = agentChatService.undoLastAction(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.ok("Agent action undone successfully", receipt));
    }

    @PostMapping("/undo/{logId}")
    @Operation(summary = "Undo a specific agent mutation by log ID")
    public ResponseEntity<ApiResponse<AgentActionReceipt>> undoActionById(
            @PathVariable UUID logId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        AgentActionReceipt receipt = agentChatService.undoActionById(userDetails.getId(), logId);
        return ResponseEntity.ok(ApiResponse.ok("Agent action undone successfully", receipt));
    }

    @GetMapping("/logs")
    @Operation(summary = "Get recent agent action audit logs")
    public ResponseEntity<ApiResponse<List<AgentActionReceipt>>> getRecentLogs(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<AgentActionReceipt> logs = agentChatService.getRecentLogs(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.ok("Recent agent logs retrieved", logs));
    }
}
