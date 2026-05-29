package com.aazdoh.review.dto;

import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.review.entity.CommitmentReview;
import com.aazdoh.review.entity.FailureReason;
import com.aazdoh.review.entity.NextAction;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ReviewResponse {

    private UUID id;
    private UUID commitmentId;
    private CommitmentStatus status;
    private FailureReason failureReason;
    private String reflection;
    private NextAction nextAction;
    private OffsetDateTime reviewedAt;

    public ReviewResponse() {
    }

    public static ReviewResponse fromEntity(CommitmentReview review) {
        ReviewResponse res = new ReviewResponse();
        res.setId(review.getId());
        res.setCommitmentId(review.getCommitment().getId());
        res.setStatus(review.getStatus());
        res.setFailureReason(review.getFailureReason());
        res.setReflection(review.getReflection());
        res.setNextAction(review.getNextAction());
        res.setReviewedAt(review.getReviewedAt());
        return res;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCommitmentId() {
        return commitmentId;
    }

    public void setCommitmentId(UUID commitmentId) {
        this.commitmentId = commitmentId;
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

    public OffsetDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(OffsetDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}
