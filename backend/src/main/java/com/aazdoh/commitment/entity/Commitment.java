package com.aazdoh.commitment.entity;

import com.aazdoh.common.entity.BaseEntity;
import com.aazdoh.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "commitments")
public class Commitment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "expected_outcome", columnDefinition = "TEXT")
    private String expectedOutcome;

    @Column(name = "estimated_minutes", nullable = false)
    private int estimatedMinutes = 60;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CommitmentPriority priority = CommitmentPriority.MEDIUM;

    @Column(name = "commitment_date", nullable = false)
    private LocalDate commitmentDate;

    @Column(name = "deadline")
    private OffsetDateTime deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CommitmentStatus status = CommitmentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CommitmentVisibility visibility = CommitmentVisibility.SHARED_WITH_PARTNER;

    @Column(name = "postponed_from_id")
    private UUID postponedFromId;

    @Column(name = "origin_commitment_id")
    private UUID originCommitmentId;

    @Column(name = "postponement_count", nullable = false)
    private int postponementCount = 0;

    @Column(name = "postpone_reason", columnDefinition = "TEXT")
    private String postponeReason;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    public Commitment() {
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public String getPostponeReason() {
        return postponeReason;
    }

    public void setPostponeReason(String postponeReason) {
        this.postponeReason = postponeReason;
    }

    public OffsetDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(OffsetDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public OffsetDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(OffsetDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
}
