package com.aazdoh.common.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String CACHE_USER_DETAILS_EMAIL = "userDetailsByEmail";
    public static final String CACHE_USER_DETAILS_ID = "userDetailsById";
    public static final String CACHE_AI_INSIGHTS = "ai_insights";
    public static final String CACHE_ANALYTICS_SUMMARY = "analyticsSummary";
    public static final String CACHE_COMPREHENSIVE_ANALYTICS = "comprehensiveAnalytics";
    public static final String CACHE_FOCUS_SPRINT_ANALYTICS = "focusSprintAnalytics";
    public static final String CACHE_USER_EXECUTION_STATS = "userExecutionStats";
    public static final String CACHE_API_KEY_USER_DETAILS = "apiKeyUserDetails";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        
        // Default Caffeine spec: max 1,000 entries, expires 15 minutes after write.
        // Dynamic on-demand cache creation is enabled by not setting a restrictive cacheNames list.
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(Duration.ofMinutes(15))
                .recordStats());

        return cacheManager;
    }
}
