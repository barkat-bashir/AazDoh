package com.aazdoh.ai.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class AiMissedReviewRequest {

    @NotNull(message = "Commitment ID is required")
    private UUID commitmentId;

    public AiMissedReviewRequest() {
    }

    public AiMissedReviewRequest(UUID commitmentId) {
        this.commitmentId = commitmentId;
    }

    public UUID getCommitmentId() {
        return commitmentId;
    }

    public void setCommitmentId(UUID commitmentId) {
        this.commitmentId = commitmentId;
    }
}
