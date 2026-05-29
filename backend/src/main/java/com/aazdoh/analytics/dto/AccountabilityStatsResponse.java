package com.aazdoh.analytics.dto;

import java.util.List;

public class AccountabilityStatsResponse {

    private int daysAnalyzed;
    private long totalCommitments;
    private long completedCommitments;
    private long missedCommitments;
    private long postponedCommitments;
    private double completionRate;
    private double totalFocusHours;
    private double avgDailyFocusHours;
    private List<FailureReasonStatsDto> failureBreakdown;

    public AccountabilityStatsResponse() {
    }

    public int getDaysAnalyzed() {
        return daysAnalyzed;
    }

    public void setDaysAnalyzed(int daysAnalyzed) {
        this.daysAnalyzed = daysAnalyzed;
    }

    public long getTotalCommitments() {
        return totalCommitments;
    }

    public void setTotalCommitments(long totalCommitments) {
        this.totalCommitments = totalCommitments;
    }

    public long getCompletedCommitments() {
        return completedCommitments;
    }

    public void setCompletedCommitments(long completedCommitments) {
        this.completedCommitments = completedCommitments;
    }

    public long getMissedCommitments() {
        return missedCommitments;
    }

    public void setMissedCommitments(long missedCommitments) {
        this.missedCommitments = missedCommitments;
    }

    public long getPostponedCommitments() {
        return postponedCommitments;
    }

    public void setPostponedCommitments(long postponedCommitments) {
        this.postponedCommitments = postponedCommitments;
    }

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }

    public double getTotalFocusHours() {
        return totalFocusHours;
    }

    public void setTotalFocusHours(double totalFocusHours) {
        this.totalFocusHours = totalFocusHours;
    }

    public double getAvgDailyFocusHours() {
        return avgDailyFocusHours;
    }

    public void setAvgDailyFocusHours(double avgDailyFocusHours) {
        this.avgDailyFocusHours = avgDailyFocusHours;
    }

    public List<FailureReasonStatsDto> getFailureBreakdown() {
        return failureBreakdown;
    }

    public void setFailureBreakdown(List<FailureReasonStatsDto> failureBreakdown) {
        this.failureBreakdown = failureBreakdown;
    }
}
