package com.aazdoh.ai.entity;

import com.aazdoh.common.entity.BaseEntity;
import com.aazdoh.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;

@Entity
@Table(
        name = "ai_stress_test_snapshots",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_user_date_plan_hash", columnNames = {"user_id", "commitment_date", "plan_hash"})
        }
)
public class AiStressTestSnapshot extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "commitment_date", nullable = false)
    private LocalDate commitmentDate;

    @Column(name = "plan_hash", nullable = false, length = 64)
    private String planHash;

    @Column(name = "risk_score", nullable = false)
    private int riskScore;

    @Column(name = "risk_level", nullable = false, length = 30)
    private String riskLevel;

    @Column(name = "diagnostic_summary", columnDefinition = "TEXT", nullable = false)
    private String diagnosticSummary;

    @Column(name = "planned_hours", nullable = false)
    private double plannedHours;

    @Column(name = "capacity_hours", nullable = false)
    private double capacityHours;

    @Column(name = "optimized_hours", nullable = false)
    private double optimizedHours;

    @Column(name = "proposals_json", columnDefinition = "TEXT")
    private String proposalsJson;

    public AiStressTestSnapshot() {
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDate getCommitmentDate() {
        return commitmentDate;
    }

    public void setCommitmentDate(LocalDate commitmentDate) {
        this.commitmentDate = commitmentDate;
    }

    public String getPlanHash() {
        return planHash;
    }

    public void setPlanHash(String planHash) {
        this.planHash = planHash;
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

    public double getCapacityHours() {
        return capacityHours;
    }

    public void setCapacityHours(double capacityHours) {
        this.capacityHours = capacityHours;
    }

    public double getOptimizedHours() {
        return optimizedHours;
    }

    public void setOptimizedHours(double optimizedHours) {
        this.optimizedHours = optimizedHours;
    }

    public String getProposalsJson() {
        return proposalsJson;
    }

    public void setProposalsJson(String proposalsJson) {
        this.proposalsJson = proposalsJson;
    }
}
