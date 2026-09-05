package com.aazdoh.analytics.dto;

public class HeatmapDayDto {
    private String date; // yyyy-MM-dd
    private int completedCount;
    private int totalCount;
    private int focusMinutes;
    private int intensityLevel; // 0 = 0m, 1 = 1-60m, 2 = 61-120m, 3 = 121-240m, 4 = >240m

    public HeatmapDayDto() {}

    public HeatmapDayDto(String date, int completedCount, int totalCount, int focusMinutes, int intensityLevel) {
        this.date = date;
        this.completedCount = completedCount;
        this.totalCount = totalCount;
        this.focusMinutes = focusMinutes;
        this.intensityLevel = intensityLevel;
    }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public int getCompletedCount() { return completedCount; }
    public void setCompletedCount(int completedCount) { this.completedCount = completedCount; }
    public int getTotalCount() { return totalCount; }
    public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
    public int getFocusMinutes() { return focusMinutes; }
    public void setFocusMinutes(int focusMinutes) { this.focusMinutes = focusMinutes; }
    public int getIntensityLevel() { return intensityLevel; }
    public void setIntensityLevel(int intensityLevel) { this.intensityLevel = intensityLevel; }
}
