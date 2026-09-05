package com.aazdoh.analytics.dto;

import java.util.List;

public class FocusSprintAnalyticsResponse {

    private int daysAnalyzed;
    private long totalSprintsCompleted;
    private long totalSprintsAttempted;
    private int totalFocusMinutesLogged;
    private double sprintCompletionRate;
    private double avgDistractionsPerSprint;
    private double actualVsEstimatedRatio;
    private List<CadenceBreakdownDto> cadenceStats;
    private List<SprintFatiguePositionDto> fatigueCurve;

    public FocusSprintAnalyticsResponse() {
    }

    public int getDaysAnalyzed() {
        return daysAnalyzed;
    }

    public void setDaysAnalyzed(int daysAnalyzed) {
        this.daysAnalyzed = daysAnalyzed;
    }

    public long getTotalSprintsCompleted() {
        return totalSprintsCompleted;
    }

    public void setTotalSprintsCompleted(long totalSprintsCompleted) {
        this.totalSprintsCompleted = totalSprintsCompleted;
    }

    public long getTotalSprintsAttempted() {
        return totalSprintsAttempted;
    }

    public void setTotalSprintsAttempted(long totalSprintsAttempted) {
        this.totalSprintsAttempted = totalSprintsAttempted;
    }

    public int getTotalFocusMinutesLogged() {
        return totalFocusMinutesLogged;
    }

    public void setTotalFocusMinutesLogged(int totalFocusMinutesLogged) {
        this.totalFocusMinutesLogged = totalFocusMinutesLogged;
    }

    public double getSprintCompletionRate() {
        return sprintCompletionRate;
    }

    public void setSprintCompletionRate(double sprintCompletionRate) {
        this.sprintCompletionRate = sprintCompletionRate;
    }

    public double getAvgDistractionsPerSprint() {
        return avgDistractionsPerSprint;
    }

    public void setAvgDistractionsPerSprint(double avgDistractionsPerSprint) {
        this.avgDistractionsPerSprint = avgDistractionsPerSprint;
    }

    public double getActualVsEstimatedRatio() {
        return actualVsEstimatedRatio;
    }

    public void setActualVsEstimatedRatio(double actualVsEstimatedRatio) {
        this.actualVsEstimatedRatio = actualVsEstimatedRatio;
    }

    public List<CadenceBreakdownDto> getCadenceStats() {
        return cadenceStats;
    }

    public void setCadenceStats(List<CadenceBreakdownDto> cadenceStats) {
        this.cadenceStats = cadenceStats;
    }

    public List<SprintFatiguePositionDto> getFatigueCurve() {
        return fatigueCurve;
    }

    public void setFatigueCurve(List<SprintFatiguePositionDto> fatigueCurve) {
        this.fatigueCurve = fatigueCurve;
    }
}
