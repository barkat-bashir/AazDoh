package com.aazdoh.analytics.entity;

import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.common.entity.BaseEntity;
import com.aazdoh.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "focus_sprints")
public class FocusSprint extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commitment_id")
    private Commitment commitment;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes = 25;

    @Column(name = "actual_seconds_spent", nullable = false)
    private int actualSecondsSpent = 0;

    @Column(nullable = false, length = 30)
    private String mode = "FOCUS"; // FOCUS, SHORT_BREAK, LONG_BREAK

    @Column(nullable = false, length = 30)
    private String status = "COMPLETED"; // COMPLETED, ABANDONED, EXTENDED

    @Column(name = "distractions_count", nullable = false)
    private int distractionsCount = 0;

    @Column(name = "distraction_notes", columnDefinition = "TEXT")
    private String distractionNotes;

    @Column(name = "started_at", nullable = false)
    private OffsetDateTime startedAt;

    @Column(name = "completed_at", nullable = false)
    private OffsetDateTime completedAt;

    public FocusSprint() {
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Commitment getCommitment() {
        return commitment;
    }

    public void setCommitment(Commitment commitment) {
        this.commitment = commitment;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public int getActualSecondsSpent() {
        return actualSecondsSpent;
    }

    public void setActualSecondsSpent(int actualSecondsSpent) {
        this.actualSecondsSpent = actualSecondsSpent;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getDistractionsCount() {
        return distractionsCount;
    }

    public void setDistractionsCount(int distractionsCount) {
        this.distractionsCount = distractionsCount;
    }

    public String getDistractionNotes() {
        return distractionNotes;
    }

    public void setDistractionNotes(String distractionNotes) {
        this.distractionNotes = distractionNotes;
    }

    public OffsetDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(OffsetDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public OffsetDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(OffsetDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
