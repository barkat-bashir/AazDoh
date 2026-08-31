package com.aazdoh.ai.dto;

import java.time.LocalDate;

public class PlanStressTestRequest {

    private LocalDate date;
    private String quickDefense;
    private boolean overrideSprint;

    public PlanStressTestRequest() {
    }

    public PlanStressTestRequest(LocalDate date, String quickDefense, boolean overrideSprint) {
        this.date = date;
        this.quickDefense = quickDefense;
        this.overrideSprint = overrideSprint;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getQuickDefense() {
        return quickDefense;
    }

    public void setQuickDefense(String quickDefense) {
        this.quickDefense = quickDefense;
    }

    public boolean isOverrideSprint() {
        return overrideSprint;
    }

    public void setOverrideSprint(boolean overrideSprint) {
        this.overrideSprint = overrideSprint;
    }
}
