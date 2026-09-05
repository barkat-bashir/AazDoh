package com.aazdoh.analytics.dto;

public class DurationBucketStatsDto {
    private String bucketLabel;
    private int minMinutes;
    private int maxMinutes;
    private long totalCount;
    private long completedCount;
    private double winRate;
    private boolean isOptimal;

    public DurationBucketStatsDto() {}

    public DurationBucketStatsDto(String bucketLabel, int minMinutes, int maxMinutes, long totalCount, long completedCount, double winRate, boolean isOptimal) {
        this.bucketLabel = bucketLabel;
        this.minMinutes = minMinutes;
        this.maxMinutes = maxMinutes;
        this.totalCount = totalCount;
        this.completedCount = completedCount;
        this.winRate = winRate;
        this.isOptimal = isOptimal;
    }

    public String getBucketLabel() { return bucketLabel; }
    public void setBucketLabel(String bucketLabel) { this.bucketLabel = bucketLabel; }
    public int getMinMinutes() { return minMinutes; }
    public void setMinMinutes(int minMinutes) { this.minMinutes = minMinutes; }
    public int getMaxMinutes() { return maxMinutes; }
    public void setMaxMinutes(int maxMinutes) { this.maxMinutes = maxMinutes; }
    public long getTotalCount() { return totalCount; }
    public void setTotalCount(long totalCount) { this.totalCount = totalCount; }
    public long getCompletedCount() { return completedCount; }
    public void setCompletedCount(long completedCount) { this.completedCount = completedCount; }
    public double getWinRate() { return winRate; }
    public void setWinRate(double winRate) { this.winRate = winRate; }
    public boolean isOptimal() { return isOptimal; }
    public void setOptimal(boolean optimal) { isOptimal = optimal; }
}
