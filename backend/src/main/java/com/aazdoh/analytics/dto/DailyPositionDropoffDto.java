package com.aazdoh.analytics.dto;

public class DailyPositionDropoffDto {
    private String positionLabel; // e.g. "Task #1 (Lead)", "Task #2", "Task #3", "Task #4", "Task #5+ (Tail)"
    private int positionIndex;
    private long totalCount;
    private long completedCount;
    private double winRate;

    public DailyPositionDropoffDto() {}

    public DailyPositionDropoffDto(String positionLabel, int positionIndex, long totalCount, long completedCount, double winRate) {
        this.positionLabel = positionLabel;
        this.positionIndex = positionIndex;
        this.totalCount = totalCount;
        this.completedCount = completedCount;
        this.winRate = winRate;
    }

    public String getPositionLabel() { return positionLabel; }
    public void setPositionLabel(String positionLabel) { this.positionLabel = positionLabel; }
    public int getPositionIndex() { return positionIndex; }
    public void setPositionIndex(int positionIndex) { this.positionIndex = positionIndex; }
    public long getTotalCount() { return totalCount; }
    public void setTotalCount(long totalCount) { this.totalCount = totalCount; }
    public long getCompletedCount() { return completedCount; }
    public void setCompletedCount(long completedCount) { this.completedCount = completedCount; }
    public double getWinRate() { return winRate; }
    public void setWinRate(double winRate) { this.winRate = winRate; }
}
