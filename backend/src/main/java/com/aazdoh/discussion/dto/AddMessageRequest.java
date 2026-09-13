package com.aazdoh.discussion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AddMessageRequest {

    @NotBlank(message = "Message cannot be empty")
    @Size(max = 500, message = "Message must not exceed 500 characters")
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
