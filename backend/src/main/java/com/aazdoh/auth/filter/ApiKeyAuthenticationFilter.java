package com.aazdoh.auth.filter;

import com.aazdoh.auth.service.ApiKeyService;
import com.aazdoh.auth.service.CustomUserDetails;
import com.aazdoh.user.entity.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(ApiKeyAuthenticationFilter.class);

    private final ApiKeyService apiKeyService;

    public ApiKeyAuthenticationFilter(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // If already authenticated, proceed
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String rawKey = extractApiKey(request);

        if (rawKey != null && rawKey.startsWith("aazdoh_live_")) {
            try {
                CustomUserDetails userDetails = apiKeyService.validateKeyAndGetUserDetails(rawKey);
                if (userDetails != null) {
                    if (userDetails.isEnabled()) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        log.debug("Successfully authenticated API key for user: {}", userDetails.getUsername());
                    } else {
                        log.warn("API key matched user but account is inactive: {}", userDetails.getUsername());
                    }
                } else {
                    log.warn("API key validation returned empty for key with prefix: {}", rawKey.substring(0, Math.min(rawKey.length(), 20)));
                }
            } catch (Exception ex) {
                log.error("Exception during API key authentication: {}", ex.getMessage(), ex);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractApiKey(HttpServletRequest request) {
        // 1. Check dedicated X-API-Key header
        String xApiKey = request.getHeader("X-API-Key");
        if (xApiKey != null && !xApiKey.isBlank()) {
            return xApiKey.trim();
        }

        // 2. Check Authorization header for Bearer or ApiKey prefix with aazdoh_live_
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null) {
            String trimmed = authHeader.trim();
            if (trimmed.startsWith("Bearer aazdoh_live_")) {
                return trimmed.substring(7).trim();
            }
            if (trimmed.startsWith("ApiKey aazdoh_live_") || trimmed.startsWith("apikey aazdoh_live_")) {
                return trimmed.substring(7).trim();
            }
            if (trimmed.startsWith("aazdoh_live_")) {
                return trimmed;
            }
        }

        return null;
    }

    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return false;
    }
}
