package com.aazdoh.review.dto;

import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.review.entity.FailureReason;
import com.aazdoh.review.entity.NextAction;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class ReviewCommitmentRequest {

    @NotNull(message = "Status is required (COMPLETED, MISSED, PARTIALLY_COMPLETED)")
    private CommitmentStatus status;

    private FailureReason failureReason;

    private String reflection;

    private NextAction nextAction;

    private LocalDate rescheduleDate;

    public ReviewCommitmentRequest() {
    }

    public CommitmentStatus getStatus() {
        return status;
    }

    public void setStatus(CommitmentStatus status) {
        this.status = status;
    }

    public FailureReason getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(FailureReason failureReason) {
        this.failureReason = failureReason;
    }

    public String getReflection() {
        return reflection;
    }

    public void setReflection(String reflection) {
        this.reflection = reflection;
    }

    public NextAction getNextAction() {
        return nextAction;
    }

    public void setNextAction(NextAction nextAction) {
        this.nextAction = nextAction;
    }

    public LocalDate getRescheduleDate() {
        return rescheduleDate;
    }

    public void setRescheduleDate(LocalDate rescheduleDate) {
        this.rescheduleDate = rescheduleDate;
    }
}
