package com.aazdoh.ai.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class AgentActionReceipt {

    private UUID id;
    private String actionType;
    private String description;
    private boolean undone;
    private OffsetDateTime createdAt;

    public AgentActionReceipt() {
    }

    public AgentActionReceipt(UUID id, String actionType, String description, boolean undone, OffsetDateTime createdAt) {
        this.id = id;
        this.actionType = actionType;
        this.description = description;
        this.undone = undone;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isUndone() {
        return undone;
    }

    public void setUndone(boolean undone) {
        this.undone = undone;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
