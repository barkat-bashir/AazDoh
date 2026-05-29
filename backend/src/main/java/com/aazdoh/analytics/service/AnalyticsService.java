package com.aazdoh.analytics.service;

import com.aazdoh.analytics.dto.AccountabilityStatsResponse;
import com.aazdoh.analytics.dto.FailureReasonStatsDto;
import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.review.entity.FailureReason;
import com.aazdoh.review.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AnalyticsService {

    private final CommitmentRepository commitmentRepository;
    private final ReviewRepository reviewRepository;

    public AnalyticsService(CommitmentRepository commitmentRepository, ReviewRepository reviewRepository) {
        this.commitmentRepository = commitmentRepository;
        this.reviewRepository = reviewRepository;
    }

    public AccountabilityStatsResponse getAccountabilitySummary(UUID userId, int days) {
        int targetDays = days > 0 ? days : 30;
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(targetDays);

        List<Commitment> commitments = commitmentRepository.findByUserIdAndDateRange(userId, startDate, endDate);

        long total = commitments.size();
        long completed = commitments.stream().filter(c -> c.getStatus() == CommitmentStatus.COMPLETED).count();
        long missed = commitments.stream().filter(c -> c.getStatus() == CommitmentStatus.MISSED).count();
        long postponed = commitments.stream().filter(c -> c.getStatus() == CommitmentStatus.POSTPONED || c.getPostponedFromId() != null).count();

        double completionRate = total > 0 ? ((double) completed / total) * 100.0 : 0.0;
        int totalMinutes = commitments.stream()
                .filter(c -> c.getStatus() == CommitmentStatus.COMPLETED)
                .mapToInt(Commitment::getEstimatedMinutes)
                .sum();
        double totalHours = totalMinutes / 60.0;
        double avgDailyHours = totalHours / targetDays;

        // Failure reasons
        List<Object[]> reasonCounts = reviewRepository.countFailureReasonsByUserId(userId);
        long totalFailuresReported = 0;
        for (Object[] row : reasonCounts) {
            if (row[1] instanceof Long count) {
                totalFailuresReported += count;
            }
        }

        List<FailureReasonStatsDto> breakdown = new ArrayList<>();
        for (Object[] row : reasonCounts) {
            if (row[0] instanceof FailureReason reason && row[1] instanceof Long count) {
                double pct = totalFailuresReported > 0 ? ((double) count / totalFailuresReported) * 100.0 : 0.0;
                breakdown.add(new FailureReasonStatsDto(reason, count, pct));
            }
        }

        AccountabilityStatsResponse response = new AccountabilityStatsResponse();
        response.setDaysAnalyzed(targetDays);
        response.setTotalCommitments(total);
        response.setCompletedCommitments(completed);
        response.setMissedCommitments(missed);
        response.setPostponedCommitments(postponed);
        response.setCompletionRate(completionRate);
        response.setTotalFocusHours(totalHours);
        response.setAvgDailyFocusHours(avgDailyHours);
        response.setFailureBreakdown(breakdown);

        return response;
    }
}
