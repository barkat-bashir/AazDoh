package com.aazdoh.ai.context;

import com.aazdoh.analytics.entity.UserExecutionStats;
import com.aazdoh.analytics.service.UserExecutionStatsService;
import com.aazdoh.review.entity.FailureReason;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.service.UserService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@Transactional(readOnly = true)
public class AccountabilityContextBuilder {

    private final UserService userService;
    private final UserExecutionStatsService statsService;
    private final ObjectMapper objectMapper;

    public AccountabilityContextBuilder(
            UserService userService,
            UserExecutionStatsService statsService,
            ObjectMapper objectMapper
    ) {
        this.userService = userService;
        this.statsService = statsService;
        this.objectMapper = objectMapper;
    }

    public UserAccountabilityContextDto buildContext(UUID userId) {
        User user = userService.findUserById(userId);
        UserExecutionStats stats = statsService.getOrComputeStats(userId);

        Map<FailureReason, Long> failureMap = new HashMap<>();
        if (stats.getFailureBreakdownJson() != null && !stats.getFailureBreakdownJson().isBlank()) {
            try {
                Map<String, Long> rawMap = objectMapper.readValue(
                        stats.getFailureBreakdownJson(),
                        new TypeReference<Map<String, Long>>() {}
                );
                for (Map.Entry<String, Long> entry : rawMap.entrySet()) {
                    try {
                        failureMap.put(FailureReason.valueOf(entry.getKey()), entry.getValue());
                    } catch (Exception ignored) {}
                }
            } catch (Exception ignored) {}
        }

        List<String> postponedTitles = Collections.emptyList();
        if (stats.getRepeatedlyPostponedTitlesJson() != null && !stats.getRepeatedlyPostponedTitlesJson().isBlank()) {
            try {
                postponedTitles = objectMapper.readValue(
                        stats.getRepeatedlyPostponedTitlesJson(),
                        new TypeReference<List<String>>() {}
                );
            } catch (Exception ignored) {}
        }

        UserAccountabilityContextDto context = new UserAccountabilityContextDto();
        context.setUserFullName(user.getFullName());
        context.setTimezone(user.getTimezone());
        context.setPersona(user.getAiPersona());
        context.setTotalCommitmentsLast7Days(stats.getRolling7dTotalTasks());
        context.setCompletedCommitmentsLast7Days(stats.getRolling7dCompletedTasks());
        context.setCompletionRateLast7Days(stats.getRolling7dCompletionRate());
        context.setAvgDailyFocusMinutesLast7Days(stats.getRolling7dAvgDailyFocusMinutes());
        context.setRepeatedlyPostponedTitles(postponedTitles);
        context.setTopFailureReasons(failureMap);

        return context;
    }
}
