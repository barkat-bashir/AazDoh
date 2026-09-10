package com.aazdoh.ai.dto;

import java.util.UUID;

public class AgentActionItem {

    private String actionType; // COMPLETE_COMMITMENT, CREATE_COMMITMENT, POSTPONE_COMMITMENT, UPDATE_COMMITMENT, DELETE_COMMITMENT, MARK_MISSED
    private String targetTitle;
    private UUID targetId;
    private String title;
    private Integer estimatedMinutes;
    private String priority; // HIGH, MEDIUM, LOW, URGENT
    private String category; // DEEP_WORK, ROUTINE, LEARNING, HABIT, HEALTH
    private String expectedOutcome;
    private String targetDate; // YYYY-MM-DD
    private String reason;

    public AgentActionItem() {
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public String getTargetTitle() {
        return targetTitle;
    }

    public void setTargetTitle(String targetTitle) {
        this.targetTitle = targetTitle;
    }

    public UUID getTargetId() {
        return targetId;
    }

    public void setTargetId(UUID targetId) {
        this.targetId = targetId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getEstimatedMinutes() {
        return estimatedMinutes;
    }

    public void setEstimatedMinutes(Integer estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getExpectedOutcome() {
        return expectedOutcome;
    }

    public void setExpectedOutcome(String expectedOutcome) {
        this.expectedOutcome = expectedOutcome;
    }

    public String getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(String targetDate) {
        this.targetDate = targetDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
