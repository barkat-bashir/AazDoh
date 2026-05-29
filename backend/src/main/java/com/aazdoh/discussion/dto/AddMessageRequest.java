package com.aazdoh.discussion.dto;

import jakarta.validation.constraints.NotBlank;

public class AddMessageRequest {

    @NotBlank(message = "Message cannot be empty")
    private String message;

    public AddMessageRequest() {
    }

    public AddMessageRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
