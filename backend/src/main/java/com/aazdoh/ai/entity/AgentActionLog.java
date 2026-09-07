package com.aazdoh.ai.entity;

import com.aazdoh.common.entity.BaseEntity;
import com.aazdoh.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "agent_action_logs")
public class AgentActionLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "action_type", nullable = false, length = 64)
    private String actionType;

    @Column(name = "target_entity_type", nullable = false, length = 64)
    private String targetEntityType;

    @Column(name = "target_entity_id")
    private UUID targetEntityId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "before_state_json", columnDefinition = "TEXT")
    private String beforeStateJson;

    @Column(name = "after_state_json", columnDefinition = "TEXT")
    private String afterStateJson;

    @Column(nullable = false)
    private boolean undone = false;

    public AgentActionLog() {
    }

    public AgentActionLog(User user, String actionType, String targetEntityType, UUID targetEntityId, String description, String beforeStateJson, String afterStateJson) {
        this.user = user;
        this.actionType = actionType;
        this.targetEntityType = targetEntityType;
        this.targetEntityId = targetEntityId;
        this.description = description;
        this.beforeStateJson = beforeStateJson;
        this.afterStateJson = afterStateJson;
        this.undone = false;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public String getTargetEntityType() {
        return targetEntityType;
    }

    public void setTargetEntityType(String targetEntityType) {
        this.targetEntityType = targetEntityType;
    }

    public UUID getTargetEntityId() {
        return targetEntityId;
    }

    public void setTargetEntityId(UUID targetEntityId) {
        this.targetEntityId = targetEntityId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBeforeStateJson() {
        return beforeStateJson;
    }

    public void setBeforeStateJson(String beforeStateJson) {
        this.beforeStateJson = beforeStateJson;
    }

    public String getAfterStateJson() {
        return afterStateJson;
    }

    public void setAfterStateJson(String afterStateJson) {
        this.afterStateJson = afterStateJson;
    }

    public boolean isUndone() {
        return undone;
    }

    public void setUndone(boolean undone) {
        this.undone = undone;
    }
}
