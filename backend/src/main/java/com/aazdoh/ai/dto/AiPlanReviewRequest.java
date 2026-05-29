package com.aazdoh.ai.dto;

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public class AiPlanReviewRequest {

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate date;

    public AiPlanReviewRequest() {
    }

    public AiPlanReviewRequest(LocalDate date) {
        this.date = date;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
