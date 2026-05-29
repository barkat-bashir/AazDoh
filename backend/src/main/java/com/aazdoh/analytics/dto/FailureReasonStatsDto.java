package com.aazdoh.analytics.dto;

import com.aazdoh.review.entity.FailureReason;

public class FailureReasonStatsDto {

    private FailureReason reason;
    private long count;
    private double percentage;

    public FailureReasonStatsDto() {
    }

    public FailureReasonStatsDto(FailureReason reason, long count, double percentage) {
        this.reason = reason;
        this.count = count;
        this.percentage = percentage;
    }

    public FailureReason getReason() {
        return reason;
    }

    public void setReason(FailureReason reason) {
        this.reason = reason;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}
