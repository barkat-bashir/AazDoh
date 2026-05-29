package com.aazdoh.commitment.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class PostponeCommitmentRequest {

    @NotNull(message = "New target date is required")
    private LocalDate newDate;

    private String reason;

    public PostponeCommitmentRequest() {
    }

    public PostponeCommitmentRequest(LocalDate newDate, String reason) {
        this.newDate = newDate;
        this.reason = reason;
    }

    public LocalDate getNewDate() {
        return newDate;
    }

    public void setNewDate(LocalDate newDate) {
        this.newDate = newDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
