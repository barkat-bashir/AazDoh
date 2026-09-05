package com.aazdoh.analytics.dto;

import java.util.List;

public class ComprehensiveAnalyticsResponse {

    private int daysAnalyzed;
    private List<DayOfWeekStatsDto> dayOfWeekStats;
    private List<HeatmapDayDto> heatmap;
    private PlannedVsExecutedDto plannedVsExecuted;
    private List<DurationBucketStatsDto> durationBuckets;
    private List<ProcrastinationBottleneckDto> procrastinationBottlenecks;
    private List<DailyPositionDropoffDto> dailyDropoff;
    private List<PriorityBreakdownDto> priorityBreakdown;

    public ComprehensiveAnalyticsResponse() {
    }

    public int getDaysAnalyzed() {
        return daysAnalyzed;
    }

    public void setDaysAnalyzed(int daysAnalyzed) {
        this.daysAnalyzed = daysAnalyzed;
    }

    public List<DayOfWeekStatsDto> getDayOfWeekStats() {
        return dayOfWeekStats;
    }

    public void setDayOfWeekStats(List<DayOfWeekStatsDto> dayOfWeekStats) {
        this.dayOfWeekStats = dayOfWeekStats;
    }

    public List<HeatmapDayDto> getHeatmap() {
        return heatmap;
    }

    public void setHeatmap(List<HeatmapDayDto> heatmap) {
        this.heatmap = heatmap;
    }

    public PlannedVsExecutedDto getPlannedVsExecuted() {
        return plannedVsExecuted;
    }

    public void setPlannedVsExecuted(PlannedVsExecutedDto plannedVsExecuted) {
        this.plannedVsExecuted = plannedVsExecuted;
    }

    public List<DurationBucketStatsDto> getDurationBuckets() {
        return durationBuckets;
    }

    public void setDurationBuckets(List<DurationBucketStatsDto> durationBuckets) {
        this.durationBuckets = durationBuckets;
    }

    public List<ProcrastinationBottleneckDto> getProcrastinationBottlenecks() {
        return procrastinationBottlenecks;
    }

    public void setProcrastinationBottlenecks(List<ProcrastinationBottleneckDto> procrastinationBottlenecks) {
        this.procrastinationBottlenecks = procrastinationBottlenecks;
    }

    public List<DailyPositionDropoffDto> getDailyDropoff() {
        return dailyDropoff;
    }

    public void setDailyDropoff(List<DailyPositionDropoffDto> dailyDropoff) {
        this.dailyDropoff = dailyDropoff;
    }

    public List<PriorityBreakdownDto> getPriorityBreakdown() {
        return priorityBreakdown;
    }

    public void setPriorityBreakdown(List<PriorityBreakdownDto> priorityBreakdown) {
        this.priorityBreakdown = priorityBreakdown;
    }
}
