package com.aazdoh.analytics.dto;

public class SprintFatiguePositionDto {

    private String positionLabel;
    private int positionIndex;
    private long totalSprints;
    private long completedSprints;
    private double completionRate;

    public SprintFatiguePositionDto() {
    }

    public SprintFatiguePositionDto(String positionLabel, int positionIndex, long totalSprints, long completedSprints, double completionRate) {
        this.positionLabel = positionLabel;
        this.positionIndex = positionIndex;
        this.totalSprints = totalSprints;
        this.completedSprints = completedSprints;
        this.completionRate = completionRate;
    }

    public String getPositionLabel() {
        return positionLabel;
    }

    public void setPositionLabel(String positionLabel) {
        this.positionLabel = positionLabel;
    }

    public int getPositionIndex() {
        return positionIndex;
    }

    public void setPositionIndex(int positionIndex) {
        this.positionIndex = positionIndex;
    }

    public long getTotalSprints() {
        return totalSprints;
    }

    public void setTotalSprints(long totalSprints) {
        this.totalSprints = totalSprints;
    }

    public long getCompletedSprints() {
        return completedSprints;
    }

    public void setCompletedSprints(long completedSprints) {
        this.completedSprints = completedSprints;
    }

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }
}
