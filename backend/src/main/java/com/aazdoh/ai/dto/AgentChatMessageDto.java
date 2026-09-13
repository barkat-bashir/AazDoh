package com.aazdoh.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AgentChatMessageDto {

    @NotBlank(message = "Role is required")
    private String role;

    @NotBlank(message = "Content is required")
    @Size(max = 500, message = "Content must not exceed 500 characters")
    private String content;

    public AgentChatMessageDto() {
    }

    public AgentChatMessageDto(String role, String content) {
        this.role = role;
        this.content = content;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
