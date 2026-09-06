package com.aazdoh.auth.filter;

import com.aazdoh.auth.service.ApiKeyService;
import com.aazdoh.auth.service.CustomUserDetails;
import com.aazdoh.user.entity.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
                Optional<User> userOpt = apiKeyService.validateKeyAndGetUser(rawKey);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    if (user.isActive()) {
                        CustomUserDetails userDetails = new CustomUserDetails(user);
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            } catch (Exception ex) {
                // Let filter chain proceed; unauthenticated requests to protected endpoints will be rejected by SecurityConfig
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
