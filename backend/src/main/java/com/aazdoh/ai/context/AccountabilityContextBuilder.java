package com.aazdoh.ai.context;

import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.review.entity.FailureReason;
import com.aazdoh.review.repository.ReviewRepository;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.service.UserService;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@Transactional(readOnly = true)
public class AccountabilityContextBuilder {

    private final UserService userService;
    private final CommitmentRepository commitmentRepository;
    private final ReviewRepository reviewRepository;

    public AccountabilityContextBuilder(
            UserService userService,
            CommitmentRepository commitmentRepository,
            ReviewRepository reviewRepository
    ) {
        this.userService = userService;
        this.commitmentRepository = commitmentRepository;
        this.reviewRepository = reviewRepository;
    }

    public UserAccountabilityContextDto buildContext(UUID userId) {
        User user = userService.findUserById(userId);
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(7);

        List<Commitment> recentCommitments = commitmentRepository.findByUserIdAndDateRange(userId, sevenDaysAgo, today);
        long total7Days = recentCommitments.size();
        long completed7Days = recentCommitments.stream().filter(c -> c.getStatus() == CommitmentStatus.COMPLETED).count();
        double completionRate = total7Days > 0 ? ((double) completed7Days / total7Days) * 100.0 : 0.0;

        double totalCompletedMinutes = recentCommitments.stream()
                .filter(c -> c.getStatus() == CommitmentStatus.COMPLETED)
                .mapToInt(Commitment::getEstimatedMinutes)
                .sum();
        double avgDailyFocusMinutes = totalCompletedMinutes / 7.0;

        // Postponed commitments
        List<String> postponedTitles = recentCommitments.stream()
                .filter(c -> c.getPostponedFromId() != null || c.getStatus() == CommitmentStatus.POSTPONED)
                .map(Commitment::getTitle)
                .distinct()
                .collect(Collectors.toList());

        // Failure reasons
        Map<FailureReason, Long> failureMap = new HashMap<>();
        List<Object[]> reasonCounts = reviewRepository.countFailureReasonsByUserId(userId);
        for (Object[] row : reasonCounts) {
            if (row[0] instanceof FailureReason reason && row[1] instanceof Long count) {
                failureMap.put(reason, count);
            }
        }

        UserAccountabilityContextDto context = new UserAccountabilityContextDto();
        context.setUserFullName(user.getFullName());
        context.setTimezone(user.getTimezone());
        context.setPersona(user.getAiPersona());
        context.setTotalCommitmentsLast7Days(total7Days);
        context.setCompletedCommitmentsLast7Days(completed7Days);
        context.setCompletionRateLast7Days(completionRate);
        context.setAvgDailyFocusMinutesLast7Days(avgDailyFocusMinutes);
        context.setRepeatedlyPostponedTitles(postponedTitles);
        context.setTopFailureReasons(failureMap);

        return context;
    }
}
