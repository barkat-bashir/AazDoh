package com.aazdoh.analytics.service;

import com.aazdoh.analytics.dto.CadenceBreakdownDto;
import com.aazdoh.analytics.dto.FocusSprintAnalyticsResponse;
import com.aazdoh.analytics.dto.RecordFocusSprintRequest;
import com.aazdoh.analytics.dto.SprintFatiguePositionDto;
import com.aazdoh.analytics.entity.FocusSprint;
import com.aazdoh.analytics.repository.FocusSprintRepository;
import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.common.exception.ResourceNotFoundException;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FocusSprintService {

    private final FocusSprintRepository focusSprintRepository;
    private final UserRepository userRepository;
    private final CommitmentRepository commitmentRepository;

    public FocusSprintService(
            FocusSprintRepository focusSprintRepository,
            UserRepository userRepository,
            CommitmentRepository commitmentRepository
    ) {
        this.focusSprintRepository = focusSprintRepository;
        this.userRepository = userRepository;
        this.commitmentRepository = commitmentRepository;
    }

    @Transactional
    public FocusSprint recordSprint(UUID userId, RecordFocusSprintRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Commitment commitment = null;
        if (request.getCommitmentId() != null) {
            commitment = commitmentRepository.findById(request.getCommitmentId()).orElse(null);
        }

        FocusSprint sprint = new FocusSprint();
        sprint.setUser(user);
        sprint.setCommitment(commitment);
        sprint.setDurationMinutes(request.getDurationMinutes() > 0 ? request.getDurationMinutes() : 25);
        sprint.setActualSecondsSpent(Math.max(0, request.getActualSecondsSpent()));
        sprint.setMode(request.getMode() != null ? request.getMode() : "FOCUS");
        sprint.setStatus(request.getStatus() != null ? request.getStatus() : "COMPLETED");
        sprint.setDistractionsCount(Math.max(0, request.getDistractionsCount()));

        if (request.getDistractionNotes() != null && !request.getDistractionNotes().isEmpty()) {
            sprint.setDistractionNotes(String.join(" || ", request.getDistractionNotes()));
        }

        OffsetDateTime now = OffsetDateTime.now();
        sprint.setStartedAt(request.getStartedAt() != null ? request.getStartedAt() : now.minusMinutes(sprint.getDurationMinutes()));
        sprint.setCompletedAt(request.getCompletedAt() != null ? request.getCompletedAt() : now);

        return focusSprintRepository.save(sprint);
    }

    @Transactional(readOnly = true)
    public FocusSprintAnalyticsResponse getFocusSprintAnalytics(UUID userId, int days) {
        int targetDays = days > 0 ? days : 30;
        OffsetDateTime endDate = OffsetDateTime.now();
        OffsetDateTime startDate = endDate.minusDays(targetDays);

        List<FocusSprint> sprints = focusSprintRepository.findByUserIdAndDateRange(userId, startDate, endDate);

        List<FocusSprint> focusSprints = sprints.stream()
                .filter(s -> "FOCUS".equalsIgnoreCase(s.getMode()))
                .collect(Collectors.toList());

        long totalAttempted = focusSprints.size();
        long totalCompleted = focusSprints.stream()
                .filter(s -> "COMPLETED".equalsIgnoreCase(s.getStatus()))
                .count();

        int totalActualSeconds = focusSprints.stream()
                .mapToInt(FocusSprint::getActualSecondsSpent)
                .sum();
        int totalFocusMinutes = totalActualSeconds / 60;

        double completionRate = totalAttempted > 0 ? ((double) totalCompleted / totalAttempted) * 100.0 : 0.0;

        long totalDistractions = focusSprints.stream()
                .mapToInt(FocusSprint::getDistractionsCount)
                .sum();
        double avgDistractions = totalAttempted > 0 ? ((double) totalDistractions / totalAttempted) : 0.0;

        // Actual vs Estimated calculation for tethered tasks
        double actualVsEstimatedRatio = 1.0;
        List<FocusSprint> tetheredSprints = focusSprints.stream()
                .filter(s -> s.getCommitment() != null && s.getCommitment().getEstimatedMinutes() > 0)
                .collect(Collectors.toList());

        if (!tetheredSprints.isEmpty()) {
            double totalEstimated = tetheredSprints.stream().mapToInt(s -> s.getCommitment().getEstimatedMinutes()).sum();
            double totalActual = tetheredSprints.stream().mapToInt(s -> s.getActualSecondsSpent() / 60).sum();
            if (totalEstimated > 0 && totalActual > 0) {
                actualVsEstimatedRatio = Math.round((totalActual / totalEstimated) * 100.0) / 100.0;
            }
        }

        // Cadence Breakdown (25m, 45m, 60m, other)
        List<CadenceBreakdownDto> cadenceStats = calculateCadenceBreakdown(focusSprints);

        // Fatigue Curve across daily sprint sequence positions
        List<SprintFatiguePositionDto> fatigueCurve = calculateFatigueCurve(focusSprints);

        FocusSprintAnalyticsResponse response = new FocusSprintAnalyticsResponse();
        response.setDaysAnalyzed(targetDays);
        response.setTotalSprintsAttempted(totalAttempted);
        response.setTotalSprintsCompleted(totalCompleted);
        response.setTotalFocusMinutesLogged(totalFocusMinutes);
        response.setSprintCompletionRate(Math.round(completionRate * 10.0) / 10.0);
        response.setAvgDistractionsPerSprint(Math.round(avgDistractions * 10.0) / 10.0);
        response.setActualVsEstimatedRatio(actualVsEstimatedRatio);
        response.setCadenceStats(cadenceStats);
        response.setFatigueCurve(fatigueCurve);

        return response;
    }

    private List<CadenceBreakdownDto> calculateCadenceBreakdown(List<FocusSprint> focusSprints) {
        int[] cadences = {25, 45, 60};
        String[] labels = {"25m Sprint", "45m Deep Work", "60m Block"};

        List<CadenceBreakdownDto> list = new ArrayList<>();
        for (int i = 0; i < cadences.length; i++) {
            int targetMins = cadences[i];
            List<FocusSprint> matching = focusSprints.stream()
                    .filter(s -> s.getDurationMinutes() == targetMins)
                    .collect(Collectors.toList());

            long total = matching.size();
            long completed = matching.stream().filter(s -> "COMPLETED".equalsIgnoreCase(s.getStatus())).count();
            double successRate = total > 0 ? ((double) completed / total) * 100.0 : 0.0;

            list.add(new CadenceBreakdownDto(labels[i], targetMins, total, completed, Math.round(successRate * 10.0) / 10.0));
        }

        return list;
    }

    private List<SprintFatiguePositionDto> calculateFatigueCurve(List<FocusSprint> focusSprints) {
        Map<LocalDate, List<FocusSprint>> groupedByDay = focusSprints.stream()
                .collect(Collectors.groupingBy(s -> s.getStartedAt().toLocalDate()));

        long[] totalPos = new long[5]; // 0=Sprint #1, 1=Sprint #2, 2=Sprint #3, 3=Sprint #4, 4=Sprint #5+
        long[] completedPos = new long[5];

        for (List<FocusSprint> dayList : groupedByDay.values()) {
            List<FocusSprint> sorted = dayList.stream()
                    .sorted(Comparator.comparing(FocusSprint::getStartedAt))
                    .collect(Collectors.toList());

            for (int i = 0; i < sorted.size(); i++) {
                int posIndex = Math.min(i, 4);
                totalPos[posIndex]++;
                if ("COMPLETED".equalsIgnoreCase(sorted.get(i).getStatus())) {
                    completedPos[posIndex]++;
                }
            }
        }

        List<SprintFatiguePositionDto> curve = new ArrayList<>();
        String[] labels = {"Sprint #1 (Peak)", "Sprint #2", "Sprint #3", "Sprint #4", "Sprint #5+ (Fatigue Zone)"};

        for (int i = 0; i < 5; i++) {
            long total = totalPos[i];
            long completed = completedPos[i];
            double winRate = total > 0 ? ((double) completed / total) * 100.0 : 0.0;
            curve.add(new SprintFatiguePositionDto(labels[i], i + 1, total, completed, Math.round(winRate * 10.0) / 10.0));
        }

        return curve;
    }
}
