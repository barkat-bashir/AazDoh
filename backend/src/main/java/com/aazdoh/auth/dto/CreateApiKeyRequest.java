package com.aazdoh.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateApiKeyRequest {

    @NotBlank(message = "API key name is required")
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;

    private Integer expiresInDays;

    public CreateApiKeyRequest() {
    }

    public CreateApiKeyRequest(String name, Integer expiresInDays) {
        this.name = name;
        this.expiresInDays = expiresInDays;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getExpiresInDays() {
        return expiresInDays;
    }

    public void setExpiresInDays(Integer expiresInDays) {
        this.expiresInDays = expiresInDays;
    }
}
