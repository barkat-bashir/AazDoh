package com.aazdoh.analytics.service;

import com.aazdoh.analytics.entity.UserExecutionStats;
import com.aazdoh.analytics.repository.UserExecutionStatsRepository;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.review.entity.FailureReason;
import com.aazdoh.review.repository.ReviewRepository;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class UserExecutionStatsService {

    private static final Logger log = LoggerFactory.getLogger(UserExecutionStatsService.class);

    private final UserExecutionStatsRepository statsRepository;
    private final CommitmentRepository commitmentRepository;
    private final ReviewRepository reviewRepository;
    private final UserService userService;
    private final ObjectMapper objectMapper;

    public UserExecutionStatsService(
            UserExecutionStatsRepository statsRepository,
            CommitmentRepository commitmentRepository,
            ReviewRepository reviewRepository,
            UserService userService,
            ObjectMapper objectMapper
    ) {
        this.statsRepository = statsRepository;
        this.commitmentRepository = commitmentRepository;
        this.reviewRepository = reviewRepository;
        this.userService = userService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public UserExecutionStats getOrComputeStats(UUID userId) {
        return statsRepository.findByUserId(userId)
                .orElseGet(() -> refreshStats(userId));
    }

    @Transactional
    public UserExecutionStats refreshStats(UUID userId) {
        User user = userService.findUserById(userId);
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(7);

        // 1. Single SQL Projection Query for 7-day velocity metrics
        long total7Days = 0;
        long completed7Days = 0;
        int focusMinutes7Days = 0;

        List<Object[]> aggResults = commitmentRepository.aggregateStatsByUserIdAndDateRange(userId, sevenDaysAgo, today);
        if (aggResults != null && !aggResults.isEmpty() && aggResults.get(0) != null) {
            Object[] row = aggResults.get(0);
            if (row[0] instanceof Number total) total7Days = total.longValue();
            if (row[1] instanceof Number completed) completed7Days = completed.longValue();
            if (row[2] instanceof Number minutes) focusMinutes7Days = minutes.intValue();
        }

        double completionRate = total7Days > 0 ? ((double) completed7Days / total7Days) * 100.0 : 0.0;
        double avgDailyFocusMinutes = focusMinutes7Days / 7.0;

        // 2. Procrastinated Titles (7-day window)
        List<String> postponedTitles = commitmentRepository.findPostponedTitlesByUserIdAndDateRange(userId, sevenDaysAgo, today);
        if (postponedTitles == null) postponedTitles = Collections.emptyList();

        // 3. Failure Mode Distribution (Single indexed query)
        Map<String, Long> failureMap = new HashMap<>();
        String primaryFailureTrap = null;
        long maxFailureCount = 0;

        List<Object[]> reasonCounts = reviewRepository.countFailureReasonsByUserId(userId);
        if (reasonCounts != null) {
            for (Object[] row : reasonCounts) {
                if (row[0] instanceof FailureReason reason && row[1] instanceof Number count) {
                    long c = count.longValue();
                    failureMap.put(reason.name(), c);
                    if (c > maxFailureCount) {
                        maxFailureCount = c;
                        primaryFailureTrap = reason.name();
                    }
                }
            }
        }

        // 4. Save/Update Rollup Record
        UserExecutionStats stats = statsRepository.findByUserId(userId)
                .orElseGet(() -> new UserExecutionStats(user));

        stats.setUser(user);
        stats.setRolling7dTotalTasks(total7Days);
        stats.setRolling7dCompletedTasks(completed7Days);
        stats.setRolling7dCompletionRate(Math.round(completionRate * 10.0) / 10.0);
        stats.setRolling7dFocusMinutes(focusMinutes7Days);
        stats.setRolling7dAvgDailyFocusMinutes(Math.round(avgDailyFocusMinutes * 10.0) / 10.0);
        stats.setPrimaryFailureTrap(primaryFailureTrap);

        try {
            stats.setFailureBreakdownJson(objectMapper.writeValueAsString(failureMap));
            stats.setRepeatedlyPostponedTitlesJson(objectMapper.writeValueAsString(postponedTitles));
        } catch (Exception e) {
            log.warn("Failed to serialize execution stats JSON for user {}", userId, e);
        }

        stats.setLastComputedAt(OffsetDateTime.now());
        return statsRepository.save(stats);
    }

    @Async
    @Transactional
    public void refreshStatsAsync(UUID userId) {
        try {
            refreshStats(userId);
        } catch (Exception e) {
            log.warn("Failed to refresh execution stats asynchronously for user {}", userId, e);
        }
    }

    @Transactional
    public void updateBehavioralSynthesis(UUID userId, String synthesisJson) {
        try {
            UserExecutionStats stats = statsRepository.findByUserId(userId)
                    .orElseGet(() -> refreshStats(userId));
            stats.setBehavioralSynthesisJson(synthesisJson);
            stats.setLastSynthesizedAt(OffsetDateTime.now());
            statsRepository.save(stats);
        } catch (Exception e) {
            log.warn("Failed to save behavioral synthesis for user {}", userId, e);
        }
    }
}
