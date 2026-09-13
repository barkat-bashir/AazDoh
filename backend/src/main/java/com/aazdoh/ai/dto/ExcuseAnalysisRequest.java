package com.aazdoh.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public class ExcuseAnalysisRequest {

    private UUID commitmentId;

    @NotBlank(message = "Excuse or reason text is required")
    @Size(max = 500, message = "Excuse text must not exceed 500 characters")
    private String excuseText;

    private String type; // POSTPONE, REVIEW

    public ExcuseAnalysisRequest() {
    }

    public ExcuseAnalysisRequest(UUID commitmentId, String excuseText, String type) {
        this.commitmentId = commitmentId;
        this.excuseText = excuseText;
        this.type = type;
    }

    public UUID getCommitmentId() {
        return commitmentId;
    }

    public void setCommitmentId(UUID commitmentId) {
        this.commitmentId = commitmentId;
    }

    public String getExcuseText() {
        return excuseText;
    }

    public void setExcuseText(String excuseText) {
        this.excuseText = excuseText;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
