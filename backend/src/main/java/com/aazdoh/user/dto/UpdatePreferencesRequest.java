package com.aazdoh.user.dto;

import com.aazdoh.user.entity.AiPersona;
import jakarta.validation.constraints.Size;

public class UpdatePreferencesRequest {

    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;

    private String timezone;

    private AiPersona aiPersona;

    public UpdatePreferencesRequest() {
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public AiPersona getAiPersona() {
        return aiPersona;
    }

    public void setAiPersona(AiPersona aiPersona) {
        this.aiPersona = aiPersona;
    }
}
