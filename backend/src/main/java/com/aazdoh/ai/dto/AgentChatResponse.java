package com.aazdoh.ai.dto;

import java.util.ArrayList;
import java.util.List;

public class AgentChatResponse {

    private String reply;
    private List<AgentActionReceipt> executedActions = new ArrayList<>();
    private boolean undoAvailable = false;
    private String cognitiveWarning;

    public AgentChatResponse() {
    }

    public AgentChatResponse(String reply, List<AgentActionReceipt> executedActions, boolean undoAvailable, String cognitiveWarning) {
        this.reply = reply;
        this.executedActions = executedActions != null ? executedActions : new ArrayList<>();
        this.undoAvailable = undoAvailable;
        this.cognitiveWarning = cognitiveWarning;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public List<AgentActionReceipt> getExecutedActions() {
        return executedActions;
    }

    public void setExecutedActions(List<AgentActionReceipt> executedActions) {
        this.executedActions = executedActions;
    }

    public boolean isUndoAvailable() {
        return undoAvailable;
    }

    public void setUndoAvailable(boolean undoAvailable) {
        this.undoAvailable = undoAvailable;
    }

    public String getCognitiveWarning() {
        return cognitiveWarning;
    }

    public void setCognitiveWarning(String cognitiveWarning) {
        this.cognitiveWarning = cognitiveWarning;
    }
}
