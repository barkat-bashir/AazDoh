package com.aazdoh.analytics.dto;

public class PriorityBreakdownDto {
    private String priority;
    private long totalCount;
    private long completedCount;
    private int totalMinutes;
    private double percentageOfTime;

    public PriorityBreakdownDto() {}

    public PriorityBreakdownDto(String priority, long totalCount, long completedCount, int totalMinutes, double percentageOfTime) {
        this.priority = priority;
        this.totalCount = totalCount;
        this.completedCount = completedCount;
        this.totalMinutes = totalMinutes;
        this.percentageOfTime = percentageOfTime;
    }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public long getTotalCount() { return totalCount; }
    public void setTotalCount(long totalCount) { this.totalCount = totalCount; }
    public long getCompletedCount() { return completedCount; }
    public void setCompletedCount(long completedCount) { this.completedCount = completedCount; }
    public int getTotalMinutes() { return totalMinutes; }
    public void setTotalMinutes(int totalMinutes) { this.totalMinutes = totalMinutes; }
    public double getPercentageOfTime() { return percentageOfTime; }
    public void setPercentageOfTime(double percentageOfTime) { this.percentageOfTime = percentageOfTime; }
}
