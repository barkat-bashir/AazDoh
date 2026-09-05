package com.aazdoh.analytics.dto;

public class PlannedVsExecutedDto {
    private double plannedHours;
    private double completedHours;
    private double optimismRatio;
    private double executionEfficiency;

    public PlannedVsExecutedDto() {}

    public PlannedVsExecutedDto(double plannedHours, double completedHours, double optimismRatio, double executionEfficiency) {
        this.plannedHours = plannedHours;
        this.completedHours = completedHours;
        this.optimismRatio = optimismRatio;
        this.executionEfficiency = executionEfficiency;
    }

    public double getPlannedHours() { return plannedHours; }
    public void setPlannedHours(double plannedHours) { this.plannedHours = plannedHours; }
    public double getCompletedHours() { return completedHours; }
    public void setCompletedHours(double completedHours) { this.completedHours = completedHours; }
    public double getOptimismRatio() { return optimismRatio; }
    public void setOptimismRatio(double optimismRatio) { this.optimismRatio = optimismRatio; }
    public double getExecutionEfficiency() { return executionEfficiency; }
    public void setExecutionEfficiency(double executionEfficiency) { this.executionEfficiency = executionEfficiency; }
}
