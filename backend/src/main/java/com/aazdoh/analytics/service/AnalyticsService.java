package com.aazdoh.analytics.service;

import com.aazdoh.analytics.dto.*;
import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.entity.CommitmentPriority;
import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.review.entity.FailureReason;
import com.aazdoh.review.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final CommitmentRepository commitmentRepository;
    private final ReviewRepository reviewRepository;

    public AnalyticsService(CommitmentRepository commitmentRepository, ReviewRepository reviewRepository) {
        this.commitmentRepository = commitmentRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
    public ComprehensiveAnalyticsResponse getComprehensiveAnalytics(UUID userId, int days, int heatmapDays) {
        int targetDays = days > 0 ? days : 30;
        int targetHeatmapDays = heatmapDays > 0 ? heatmapDays : 180;
        int maxHistoryDays = Math.max(targetDays, targetHeatmapDays);

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(maxHistoryDays);

        List<Commitment> allCommitments = commitmentRepository.findByUserIdAndDateRange(userId, startDate, endDate);

        LocalDate recentStartDate = endDate.minusDays(targetDays);
        List<Commitment> recentCommitments = allCommitments.stream()
                .filter(c -> !c.getCommitmentDate().isBefore(recentStartDate))
                .collect(Collectors.toList());

        ComprehensiveAnalyticsResponse response = new ComprehensiveAnalyticsResponse();
        response.setDaysAnalyzed(targetDays);

        // 1. Day of Week Performance Matrix
        response.setDayOfWeekStats(calculateDayOfWeekStats(recentCommitments));

        // 2. Heatmap Timeline
        response.setHeatmap(calculateHeatmapTimeline(allCommitments, endDate, targetHeatmapDays));

        // 3. Planned vs Executed
        response.setPlannedVsExecuted(calculatePlannedVsExecuted(recentCommitments));

        // 4. Duration Success Curve (Sprint Sizing)
        response.setDurationBuckets(calculateDurationBuckets(recentCommitments));

        // 5. Procrastination Bottlenecks
        response.setProcrastinationBottlenecks(calculateProcrastinationBottlenecks(recentCommitments));

        // 6. Daily Task Sequence Position Drop-off
        response.setDailyDropoff(calculateDailyPositionDropoff(recentCommitments));

        // 7. Priority Breakdown
        response.setPriorityBreakdown(calculatePriorityBreakdown(recentCommitments));

        return response;
    }

    private List<DayOfWeekStatsDto> calculateDayOfWeekStats(List<Commitment> commitments) {
        Map<DayOfWeek, List<Commitment>> grouped = commitments.stream()
                .collect(Collectors.groupingBy(c -> c.getCommitmentDate().getDayOfWeek()));

        List<DayOfWeekStatsDto> stats = new ArrayList<>();
        double highestWinRate = -1;
        double lowestWinRate = 101;
        DayOfWeek peakDay = null;
        DayOfWeek frictionDay = null;

        for (DayOfWeek dow : DayOfWeek.values()) {
            List<Commitment> list = grouped.getOrDefault(dow, Collections.emptyList());
            long total = list.size();
            long completed = list.stream().filter(c -> c.getStatus() == CommitmentStatus.COMPLETED).count();
            double winRate = total > 0 ? ((double) completed / total) * 100.0 : 0.0;
            int focusMins = list.stream()
                    .filter(c -> c.getStatus() == CommitmentStatus.COMPLETED)
                    .mapToInt(Commitment::getEstimatedMinutes)
                    .sum();

            String name = dow.getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            DayOfWeekStatsDto dto = new DayOfWeekStatsDto(name, dow.getValue(), total, completed, winRate, focusMins);
            stats.add(dto);

            if (total >= 1) {
                if (winRate > highestWinRate) {
                    highestWinRate = winRate;
                    peakDay = dow;
                }
                if (winRate < lowestWinRate) {
                    lowestWinRate = winRate;
                    frictionDay = dow;
                }
            }
        }

        for (DayOfWeekStatsDto dto : stats) {
            if (peakDay != null && dto.getDayIndex() == peakDay.getValue() && dto.getTotalPlanned() >= 1) {
                dto.setPeakDay(true);
            }
            if (frictionDay != null && dto.getDayIndex() == frictionDay.getValue() && dto.getTotalPlanned() >= 1 && frictionDay != peakDay) {
                dto.setFrictionDay(true);
            }
        }

        return stats;
    }

    private List<HeatmapDayDto> calculateHeatmapTimeline(List<Commitment> commitments, LocalDate endDate, int days) {
        Map<LocalDate, List<Commitment>> grouped = commitments.stream()
                .collect(Collectors.groupingBy(Commitment::getCommitmentDate));

        List<HeatmapDayDto> timeline = new ArrayList<>();
        for (int i = days; i >= 0; i--) {
            LocalDate date = endDate.minusDays(i);
            List<Commitment> list = grouped.getOrDefault(date, Collections.emptyList());
            int total = list.size();
            int completed = (int) list.stream().filter(c -> c.getStatus() == CommitmentStatus.COMPLETED).count();
            int focusMins = list.stream()
                    .filter(c -> c.getStatus() == CommitmentStatus.COMPLETED)
                    .mapToInt(Commitment::getEstimatedMinutes)
                    .sum();

            int intensity = 0;
            if (focusMins > 0) {
                if (focusMins <= 60) intensity = 1;
                else if (focusMins <= 120) intensity = 2;
                else if (focusMins <= 240) intensity = 3;
                else intensity = 4;
            }

            timeline.add(new HeatmapDayDto(date.toString(), completed, total, focusMins, intensity));
        }
        return timeline;
    }

    private PlannedVsExecutedDto calculatePlannedVsExecuted(List<Commitment> commitments) {
        int plannedMins = commitments.stream().mapToInt(Commitment::getEstimatedMinutes).sum();
        int completedMins = commitments.stream()
                .filter(c -> c.getStatus() == CommitmentStatus.COMPLETED)
                .mapToInt(Commitment::getEstimatedMinutes)
                .sum();

        double plannedHours = plannedMins / 60.0;
        double completedHours = completedMins / 60.0;
        double optimismRatio = completedHours > 0 ? (plannedHours / completedHours) : (plannedHours > 0 ? 2.0 : 1.0);
        double efficiency = plannedHours > 0 ? ((completedHours / plannedHours) * 100.0) : 0.0;

        return new PlannedVsExecutedDto(
                Math.round(plannedHours * 10.0) / 10.0,
                Math.round(completedHours * 10.0) / 10.0,
                Math.round(optimismRatio * 100.0) / 100.0,
                Math.round(efficiency * 10.0) / 10.0
        );
    }

    private List<DurationBucketStatsDto> calculateDurationBuckets(List<Commitment> commitments) {
        List<DurationBucketStatsDto> buckets = List.of(
                new DurationBucketStatsDto("< 30m (Micro)", 1, 29, 0, 0, 0, false),
                new DurationBucketStatsDto("30–45m (Sprint)", 30, 45, 0, 0, 0, false),
                new DurationBucketStatsDto("46–60m (Standard)", 46, 60, 0, 0, 0, false),
                new DurationBucketStatsDto("61–90m (Deep Block)", 61, 90, 0, 0, 0, false),
                new DurationBucketStatsDto("> 90m (Marathon)", 91, 99999, 0, 0, 0, false)
        );

        for (Commitment c : commitments) {
            int mins = c.getEstimatedMinutes();
            boolean isCompleted = c.getStatus() == CommitmentStatus.COMPLETED;
            for (DurationBucketStatsDto b : buckets) {
                if (mins >= b.getMinMinutes() && mins <= b.getMaxMinutes()) {
                    b.setTotalCount(b.getTotalCount() + 1);
                    if (isCompleted) {
                        b.setCompletedCount(b.getCompletedCount() + 1);
                    }
                    break;
                }
            }
        }

        double maxWinRate = -1;
        DurationBucketStatsDto optimal = null;

        for (DurationBucketStatsDto b : buckets) {
            double rate = b.getTotalCount() > 0 ? ((double) b.getCompletedCount() / b.getTotalCount()) * 100.0 : 0.0;
            b.setWinRate(Math.round(rate * 10.0) / 10.0);
            if (b.getTotalCount() >= 2 && rate > maxWinRate) {
                maxWinRate = rate;
                optimal = b;
            }
        }

        if (optimal != null) {
            optimal.setOptimal(true);
        }

        return buckets;
    }

    private List<ProcrastinationBottleneckDto> calculateProcrastinationBottlenecks(List<Commitment> commitments) {
        Map<String, List<Commitment>> groupedByTitle = commitments.stream()
                .filter(c -> c.getPostponementCount() >= 1 || c.getPostponedFromId() != null || c.getStatus() == CommitmentStatus.POSTPONED)
                .collect(Collectors.groupingBy(c -> c.getTitle().trim().toLowerCase()));

        List<ProcrastinationBottleneckDto> results = new ArrayList<>();
        for (Map.Entry<String, List<Commitment>> entry : groupedByTitle.entrySet()) {
            List<Commitment> list = entry.getValue();
            Commitment latest = list.get(0);
            int maxPostponed = list.stream().mapToInt(Commitment::getPostponementCount).max().orElse(list.size());
            int count = Math.max(maxPostponed, list.size());
            if (count >= 1) {
                results.add(new ProcrastinationBottleneckDto(
                        latest.getTitle(),
                        count,
                        latest.getCommitmentDate().toString(),
                        latest.getStatus().name()
                ));
            }
        }

        results.sort((a, b) -> Integer.compare(b.getPostponementCount(), a.getPostponementCount()));
        return results.stream().limit(5).collect(Collectors.toList());
    }

    private List<DailyPositionDropoffDto> calculateDailyPositionDropoff(List<Commitment> commitments) {
        Map<LocalDate, List<Commitment>> byDate = commitments.stream()
                .collect(Collectors.groupingBy(Commitment::getCommitmentDate));

        long[] totalPos = new long[5]; // 0=Task #1, 1=Task #2, 2=Task #3, 3=Task #4, 4=Task #5+
        long[] completedPos = new long[5];

        for (List<Commitment> dayList : byDate.values()) {
            List<Commitment> sorted = dayList.stream()
                    .sorted(Comparator.comparing(Commitment::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                    .collect(Collectors.toList());

            for (int i = 0; i < sorted.size(); i++) {
                int posIndex = Math.min(i, 4);
                totalPos[posIndex]++;
                if (sorted.get(i).getStatus() == CommitmentStatus.COMPLETED) {
                    completedPos[posIndex]++;
                }
            }
        }

        List<DailyPositionDropoffDto> dropoffs = new ArrayList<>();
        String[] labels = {"Task #1 (Lead)", "Task #2", "Task #3", "Task #4", "Task #5+ (Tail)"};
        for (int i = 0; i < 5; i++) {
            long total = totalPos[i];
            long completed = completedPos[i];
            double winRate = total > 0 ? ((double) completed / total) * 100.0 : 0.0;
            dropoffs.add(new DailyPositionDropoffDto(labels[i], i + 1, total, completed, Math.round(winRate * 10.0) / 10.0));
        }

        return dropoffs;
    }

    private List<PriorityBreakdownDto> calculatePriorityBreakdown(List<Commitment> commitments) {
        Map<CommitmentPriority, List<Commitment>> byPriority = commitments.stream()
                .collect(Collectors.groupingBy(Commitment::getPriority));

        int totalCompletedMinsAll = commitments.stream()
                .filter(c -> c.getStatus() == CommitmentStatus.COMPLETED)
                .mapToInt(Commitment::getEstimatedMinutes)
                .sum();

        List<PriorityBreakdownDto> breakdown = new ArrayList<>();
        for (CommitmentPriority p : List.of(CommitmentPriority.HIGH, CommitmentPriority.MEDIUM, CommitmentPriority.LOW)) {
            List<Commitment> list = byPriority.getOrDefault(p, Collections.emptyList());
            long total = list.size();
            long completed = list.stream().filter(c -> c.getStatus() == CommitmentStatus.COMPLETED).count();
            int completedMins = list.stream()
                    .filter(c -> c.getStatus() == CommitmentStatus.COMPLETED)
                    .mapToInt(Commitment::getEstimatedMinutes)
                    .sum();

            double pct = totalCompletedMinsAll > 0 ? ((double) completedMins / totalCompletedMinsAll) * 100.0 : 0.0;
            breakdown.add(new PriorityBreakdownDto(p.name(), total, completed, completedMins, Math.round(pct * 10.0) / 10.0));
        }

        return breakdown;
    }
}
