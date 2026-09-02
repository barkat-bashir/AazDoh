package com.aazdoh.commitment.dto;

import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.entity.CommitmentPriority;
import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.commitment.entity.CommitmentVisibility;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class CommitmentResponse {

    private UUID id;
    private UUID userId;
    private String userFullName;
    private String title;
    private String description;
    private String expectedOutcome;
    private int estimatedMinutes;
    private CommitmentPriority priority;
    private LocalDate commitmentDate;
    private OffsetDateTime deadline;
    private CommitmentStatus status;
    private CommitmentVisibility visibility;
    private UUID targetPartnerId;
    private String targetPartnerName;
    private UUID postponedFromId;
    private UUID originCommitmentId;
    private int postponementCount;
    private OffsetDateTime completedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public CommitmentResponse() {
    }

    public static CommitmentResponse fromEntity(Commitment commitment) {
        CommitmentResponse response = new CommitmentResponse();
        response.setId(commitment.getId());
        response.setUserId(commitment.getUser().getId());
        response.setUserFullName(commitment.getUser().getFullName());
        response.setTitle(commitment.getTitle());
        response.setDescription(commitment.getDescription());
        response.setExpectedOutcome(commitment.getExpectedOutcome());
        response.setEstimatedMinutes(commitment.getEstimatedMinutes());
        response.setPriority(commitment.getPriority());
        response.setCommitmentDate(commitment.getCommitmentDate());
        response.setDeadline(commitment.getDeadline());
        response.setStatus(commitment.getStatus());
        response.setVisibility(commitment.getVisibility());
        response.setTargetPartnerId(commitment.getTargetPartnerId());
        response.setPostponedFromId(commitment.getPostponedFromId());
        response.setOriginCommitmentId(commitment.getOriginCommitmentId());
        response.setPostponementCount(commitment.getPostponementCount());
        response.setCompletedAt(commitment.getCompletedAt());
        response.setCreatedAt(commitment.getCreatedAt());
        response.setUpdatedAt(commitment.getUpdatedAt());
        return response;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
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

    public UUID getTargetPartnerId() {
        return targetPartnerId;
    }

    public void setTargetPartnerId(UUID targetPartnerId) {
        this.targetPartnerId = targetPartnerId;
    }

    public String getTargetPartnerName() {
        return targetPartnerName;
    }

    public void setTargetPartnerName(String targetPartnerName) {
        this.targetPartnerName = targetPartnerName;
    }

    public UUID getPostponedFromId() {
        return postponedFromId;
    }

    public void setPostponedFromId(UUID postponedFromId) {
        this.postponedFromId = postponedFromId;
    }

    public UUID getOriginCommitmentId() {
        return originCommitmentId;
    }

    public void setOriginCommitmentId(UUID originCommitmentId) {
        this.originCommitmentId = originCommitmentId;
    }

    public int getPostponementCount() {
        return postponementCount;
    }

    public void setPostponementCount(int postponementCount) {
        this.postponementCount = postponementCount;
    }

    public OffsetDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(OffsetDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
