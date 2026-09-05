package com.aazdoh.analytics.dto;

public class CadenceBreakdownDto {

    private String cadenceLabel;
    private int durationMinutes;
    private long totalAttempted;
    private long completedCount;
    private double successRate;

    public CadenceBreakdownDto() {
    }

    public CadenceBreakdownDto(String cadenceLabel, int durationMinutes, long totalAttempted, long completedCount, double successRate) {
        this.cadenceLabel = cadenceLabel;
        this.durationMinutes = durationMinutes;
        this.totalAttempted = totalAttempted;
        this.completedCount = completedCount;
        this.successRate = successRate;
    }

    public String getCadenceLabel() {
        return cadenceLabel;
    }

    public void setCadenceLabel(String cadenceLabel) {
        this.cadenceLabel = cadenceLabel;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public long getTotalAttempted() {
        return totalAttempted;
    }

    public void setTotalAttempted(long totalAttempted) {
        this.totalAttempted = totalAttempted;
    }

    public long getCompletedCount() {
        return completedCount;
    }

    public void setCompletedCount(long completedCount) {
        this.completedCount = completedCount;
    }

    public double getSuccessRate() {
        return successRate;
    }

    public void setSuccessRate(double successRate) {
        this.successRate = successRate;
    }
}
