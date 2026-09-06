package com.aazdoh.auth.controller;

import com.aazdoh.auth.dto.ApiKeyResponse;
import com.aazdoh.auth.dto.CreateApiKeyRequest;
import com.aazdoh.auth.dto.CreatedApiKeyResponse;
import com.aazdoh.auth.service.ApiKeyService;
import com.aazdoh.auth.service.CustomUserDetails;
import com.aazdoh.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/api-keys")
@Tag(name = "API Keys", description = "Endpoints for managing long-lived API keys for MCP and external agents")
@SecurityRequirement(name = "BearerAuth")
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    public ApiKeyController(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @PostMapping
    @Operation(summary = "Generate a new API key")
    public ResponseEntity<ApiResponse<CreatedApiKeyResponse>> createApiKey(
            @Valid @RequestBody CreateApiKeyRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        CreatedApiKeyResponse response = apiKeyService.generateApiKey(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("API key generated successfully. Copy it now, as it will not be shown again.", response));
    }

    @GetMapping
    @Operation(summary = "List all API keys for current user")
    public ResponseEntity<ApiResponse<List<ApiKeyResponse>>> listApiKeys(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<ApiKeyResponse> response = apiKeyService.listUserApiKeys(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.ok("API keys retrieved successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Revoke an API key")
    public ResponseEntity<ApiResponse<Void>> revokeApiKey(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        apiKeyService.revokeApiKey(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("API key revoked successfully", null));
    }
}
