package com.aazdoh.commitment.dto;

import com.aazdoh.commitment.entity.CommitmentPriority;
import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.commitment.entity.CommitmentVisibility;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public class UpdateCommitmentRequest {

    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    private String description;

    private String expectedOutcome;

    @Min(value = 5, message = "Estimated minutes must be at least 5")
    private Integer estimatedMinutes;

    private CommitmentPriority priority;

    private LocalDate commitmentDate;

    private OffsetDateTime deadline;

    private CommitmentStatus status;

    private CommitmentVisibility visibility;

    public UpdateCommitmentRequest() {
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

    public Integer getEstimatedMinutes() {
        return estimatedMinutes;
    }

    public void setEstimatedMinutes(Integer estimatedMinutes) {
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

    public CommitmentStatus getStatus() {
        return status;
    }

    public void setStatus(CommitmentStatus status) {
        this.status = status;
    }

    public CommitmentVisibility getVisibility() {
        return visibility;
    }

    public void setVisibility(CommitmentVisibility visibility) {
        this.visibility = visibility;
    }
}
