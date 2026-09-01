package com.aazdoh.common.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@Tag(name = "Health Diagnostics", description = "Service health and uptime monitoring endpoints")
public class HealthController {

    @GetMapping({"/health", "/actuator/health", "/api/v1/health"})
    @Operation(summary = "Service Health Check", description = "Returns service operational status for uptime checks (Render, Vercel, monitoring)")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "aazdoh-backend",
                "environment", "production",
                "timestamp", Instant.now().toString()
        ));
    }
}
