package com.aazdoh.ai.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class AgentChatRequest {

    @NotBlank(message = "Message is required")
    private String message;

    private List<AgentChatMessageDto> history = new ArrayList<>();

    public AgentChatRequest() {
    }

    public AgentChatRequest(String message, List<AgentChatMessageDto> history) {
        this.message = message;
        this.history = history != null ? history : new ArrayList<>();
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<AgentChatMessageDto> getHistory() {
        return history;
    }

    public void setHistory(List<AgentChatMessageDto> history) {
        this.history = history;
    }
}
