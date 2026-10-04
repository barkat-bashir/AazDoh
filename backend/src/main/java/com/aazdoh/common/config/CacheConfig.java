package com.aazdoh.common.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

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

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCacheNames(List.of(
                CACHE_USER_DETAILS_EMAIL,
                CACHE_USER_DETAILS_ID,
                CACHE_AI_INSIGHTS,
                CACHE_ANALYTICS_SUMMARY,
                CACHE_COMPREHENSIVE_ANALYTICS,
                CACHE_FOCUS_SPRINT_ANALYTICS,
                CACHE_USER_EXECUTION_STATS
        ));
        
        // Default Caffeine spec: max 1,000 entries, expires 15 minutes after write
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(Duration.ofMinutes(15))
                .recordStats());

        return cacheManager;
    }
}
