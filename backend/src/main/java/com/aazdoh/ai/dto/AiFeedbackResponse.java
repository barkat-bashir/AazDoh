package com.aazdoh.ai.dto;

import java.time.OffsetDateTime;

public class AiFeedbackResponse {

    private String feedback;
    private String persona;
    private OffsetDateTime timestamp;

    public AiFeedbackResponse() {
        this.timestamp = OffsetDateTime.now();
    }

    public AiFeedbackResponse(String feedback, String persona) {
        this.feedback = feedback;
        this.persona = persona;
        this.timestamp = OffsetDateTime.now();
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public String getPersona() {
        return persona;
    }

    public void setPersona(String persona) {
        this.persona = persona;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(OffsetDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
