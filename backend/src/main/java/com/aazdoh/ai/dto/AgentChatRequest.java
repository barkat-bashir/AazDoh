package com.aazdoh.ai.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

public class AgentChatRequest {

    @NotBlank(message = "Message is required")
    @Size(max = 500, message = "Message must not exceed 500 characters")
    private String message;

    @Size(max = 10, message = "History cannot exceed 10 messages")
    private List<@Valid AgentChatMessageDto> history = new ArrayList<>();

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
