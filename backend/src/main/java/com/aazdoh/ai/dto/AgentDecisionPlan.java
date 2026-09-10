package com.aazdoh.ai.dto;

import java.util.ArrayList;
import java.util.List;

public class AgentDecisionPlan {

    private String thought;
    private List<AgentActionItem> actions = new ArrayList<>();
    private String reply;

    public AgentDecisionPlan() {
    }

    public AgentDecisionPlan(String thought, List<AgentActionItem> actions, String reply) {
        this.thought = thought;
        this.actions = actions != null ? actions : new ArrayList<>();
        this.reply = reply;
    }

    public String getThought() {
        return thought;
    }

    public void setThought(String thought) {
        this.thought = thought;
    }

    public List<AgentActionItem> getActions() {
        return actions;
    }

    public void setActions(List<AgentActionItem> actions) {
        this.actions = actions != null ? actions : new ArrayList<>();
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }
}
