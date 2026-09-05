package com.aazdoh.analytics.dto;

public class DayOfWeekStatsDto {
    private String dayName;
    private int dayIndex; // 1 = Monday, 7 = Sunday
    private long totalPlanned;
    private long completedCount;
    private double winRate;
    private int totalFocusMinutes;
    private boolean isPeakDay;
    private boolean isFrictionDay;

    public DayOfWeekStatsDto() {}

    public DayOfWeekStatsDto(String dayName, int dayIndex, long totalPlanned, long completedCount, double winRate, int totalFocusMinutes) {
        this.dayName = dayName;
        this.dayIndex = dayIndex;
        this.totalPlanned = totalPlanned;
        this.completedCount = completedCount;
        this.winRate = winRate;
        this.totalFocusMinutes = totalFocusMinutes;
    }

    public String getDayName() { return dayName; }
    public void setDayName(String dayName) { this.dayName = dayName; }
    public int getDayIndex() { return dayIndex; }
    public void setDayIndex(int dayIndex) { this.dayIndex = dayIndex; }
    public long getTotalPlanned() { return totalPlanned; }
    public void setTotalPlanned(long totalPlanned) { this.totalPlanned = totalPlanned; }
    public long getCompletedCount() { return completedCount; }
    public void setCompletedCount(long completedCount) { this.completedCount = completedCount; }
    public double getWinRate() { return winRate; }
    public void setWinRate(double winRate) { this.winRate = winRate; }
    public int getTotalFocusMinutes() { return totalFocusMinutes; }
    public void setTotalFocusMinutes(int totalFocusMinutes) { this.totalFocusMinutes = totalFocusMinutes; }
    public boolean isPeakDay() { return isPeakDay; }
    public void setPeakDay(boolean peakDay) { isPeakDay = peakDay; }
    public boolean isFrictionDay() { return isFrictionDay; }
    public void setFrictionDay(boolean frictionDay) { isFrictionDay = frictionDay; }
}
