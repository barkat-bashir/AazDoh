package com.aazdoh.ai.dto;

import java.time.OffsetDateTime;
import java.util.List;

public class PlanStressTestResponse {

    private int riskScore; // 0 to 100
    private String riskLevel; // LOW, MODERATE, HIGH, CRITICAL
    private String diagnosticSummary;
    private double plannedHours;
    private double optimizedHours;
    private double historicalCapacityHours;
    private List<OptimizedTaskProposal> proposedOptimizations;
    private boolean validated;
    private String defenseFeedback;
    private String persona;
    private OffsetDateTime timestamp;

    public PlanStressTestResponse() {
        this.timestamp = OffsetDateTime.now();
    }

    public int getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(int riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getDiagnosticSummary() {
        return diagnosticSummary;
    }

    public void setDiagnosticSummary(String diagnosticSummary) {
        this.diagnosticSummary = diagnosticSummary;
    }

    public double getPlannedHours() {
        return plannedHours;
    }

    public void setPlannedHours(double plannedHours) {
        this.plannedHours = plannedHours;
    }

    public double getOptimizedHours() {
        return optimizedHours;
    }

    public void setOptimizedHours(double optimizedHours) {
        this.optimizedHours = optimizedHours;
    }

    public double getHistoricalCapacityHours() {
        return historicalCapacityHours;
    }

    public void setHistoricalCapacityHours(double historicalCapacityHours) {
        this.historicalCapacityHours = historicalCapacityHours;
    }

    public List<OptimizedTaskProposal> getProposedOptimizations() {
        return proposedOptimizations;
    }

    public void setProposedOptimizations(List<OptimizedTaskProposal> proposedOptimizations) {
        this.proposedOptimizations = proposedOptimizations;
    }

    public boolean isValidated() {
        return validated;
    }

    public void setValidated(boolean validated) {
        this.validated = validated;
    }

    public String getDefenseFeedback() {
        return defenseFeedback;
    }

    public void setDefenseFeedback(String defenseFeedback) {
        this.defenseFeedback = defenseFeedback;
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
