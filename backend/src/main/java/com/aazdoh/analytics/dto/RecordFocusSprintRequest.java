package com.aazdoh.analytics.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class RecordFocusSprintRequest {

    private UUID commitmentId;
    private int durationMinutes = 25;
    private int actualSecondsSpent = 0;
    private String mode = "FOCUS";
    private String status = "COMPLETED";
    private int distractionsCount = 0;
    private List<String> distractionNotes;
    private OffsetDateTime startedAt;
    private OffsetDateTime completedAt;

    public RecordFocusSprintRequest() {
    }

    public UUID getCommitmentId() {
        return commitmentId;
    }

    public void setCommitmentId(UUID commitmentId) {
        this.commitmentId = commitmentId;
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

    public List<String> getDistractionNotes() {
        return distractionNotes;
    }

    public void setDistractionNotes(List<String> distractionNotes) {
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
