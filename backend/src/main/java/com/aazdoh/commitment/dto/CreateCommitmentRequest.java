package com.aazdoh.commitment.dto;

import com.aazdoh.commitment.entity.CommitmentPriority;
import com.aazdoh.commitment.entity.CommitmentVisibility;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public class CreateCommitmentRequest {

    @NotBlank(message = "Commitment title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    private String description;

    private String expectedOutcome;

    @Min(value = 5, message = "Estimated minutes must be at least 5")
    private int estimatedMinutes = 60;

    private CommitmentPriority priority = CommitmentPriority.MEDIUM;

    @NotNull(message = "Commitment date is required")
    private LocalDate commitmentDate;

    private OffsetDateTime deadline;

    private CommitmentVisibility visibility = CommitmentVisibility.SHARED_WITH_PARTNER;

    private java.util.UUID targetPartnerId;

    public CreateCommitmentRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getExpectedOutcome() {
        return expectedOutcome;
    }

    public void setExpectedOutcome(String expectedOutcome) {
        this.expectedOutcome = expectedOutcome;
    }

    public int getEstimatedMinutes() {
        return estimatedMinutes;
    }

    public void setEstimatedMinutes(int estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
    }

    public CommitmentPriority getPriority() {
        return priority;
    }

    public void setPriority(CommitmentPriority priority) {
        this.priority = priority;
    }

    public LocalDate getCommitmentDate() {
        return commitmentDate;
    }

    public void setCommitmentDate(LocalDate commitmentDate) {
        this.commitmentDate = commitmentDate;
    }

    public OffsetDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(OffsetDateTime deadline) {
        this.deadline = deadline;
    }

    public CommitmentVisibility getVisibility() {
        return visibility;
    }

    public void setVisibility(CommitmentVisibility visibility) {
        this.visibility = visibility;
    }

    public java.util.UUID getTargetPartnerId() {
        return targetPartnerId;
    }

    public void setTargetPartnerId(java.util.UUID targetPartnerId) {
        this.targetPartnerId = targetPartnerId;
    }
}
