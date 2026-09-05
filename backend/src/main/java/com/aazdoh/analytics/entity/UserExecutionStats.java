package com.aazdoh.analytics.entity;

import com.aazdoh.common.entity.BaseEntity;
import com.aazdoh.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "user_execution_stats")
public class UserExecutionStats extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "rolling_7d_total_tasks", nullable = false)
    private long rolling7dTotalTasks = 0;

    @Column(name = "rolling_7d_completed_tasks", nullable = false)
    private long rolling7dCompletedTasks = 0;

    @Column(name = "rolling_7d_completion_rate", nullable = false)
    private double rolling7dCompletionRate = 0.0;

    @Column(name = "rolling_7d_focus_minutes", nullable = false)
    private int rolling7dFocusMinutes = 0;

    @Column(name = "rolling_7d_avg_daily_focus_minutes", nullable = false)
    private double rolling7dAvgDailyFocusMinutes = 0.0;

    @Column(name = "primary_failure_trap", length = 50)
    private String primaryFailureTrap;

    @Column(name = "failure_breakdown_json", columnDefinition = "TEXT")
    private String failureBreakdownJson;

    @Column(name = "repeatedly_postponed_titles_json", columnDefinition = "TEXT")
    private String repeatedlyPostponedTitlesJson;

    @Column(name = "behavioral_synthesis_json", columnDefinition = "TEXT")
    private String behavioralSynthesisJson;

    @Column(name = "last_synthesized_at")
    private OffsetDateTime lastSynthesizedAt;

    @Column(name = "last_computed_at")
    private OffsetDateTime lastComputedAt;

    public UserExecutionStats() {
    }

    public UserExecutionStats(User user) {
        this.user = user;
        this.lastComputedAt = OffsetDateTime.now();
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public long getRolling7dTotalTasks() {
        return rolling7dTotalTasks;
    }

    public void setRolling7dTotalTasks(long rolling7dTotalTasks) {
        this.rolling7dTotalTasks = rolling7dTotalTasks;
    }

    public long getRolling7dCompletedTasks() {
        return rolling7dCompletedTasks;
    }

    public void setRolling7dCompletedTasks(long rolling7dCompletedTasks) {
        this.rolling7dCompletedTasks = rolling7dCompletedTasks;
    }

    public double getRolling7dCompletionRate() {
        return rolling7dCompletionRate;
    }

    public void setRolling7dCompletionRate(double rolling7dCompletionRate) {
        this.rolling7dCompletionRate = rolling7dCompletionRate;
    }

    public int getRolling7dFocusMinutes() {
        return rolling7dFocusMinutes;
    }

    public void setRolling7dFocusMinutes(int rolling7dFocusMinutes) {
        this.rolling7dFocusMinutes = rolling7dFocusMinutes;
    }

    public double getRolling7dAvgDailyFocusMinutes() {
        return rolling7dAvgDailyFocusMinutes;
    }

    public void setRolling7dAvgDailyFocusMinutes(double rolling7dAvgDailyFocusMinutes) {
        this.rolling7dAvgDailyFocusMinutes = rolling7dAvgDailyFocusMinutes;
    }

    public String getPrimaryFailureTrap() {
        return primaryFailureTrap;
    }

    public void setPrimaryFailureTrap(String primaryFailureTrap) {
        this.primaryFailureTrap = primaryFailureTrap;
    }

    public String getFailureBreakdownJson() {
        return failureBreakdownJson;
    }

    public void setFailureBreakdownJson(String failureBreakdownJson) {
        this.failureBreakdownJson = failureBreakdownJson;
    }

    public String getRepeatedlyPostponedTitlesJson() {
        return repeatedlyPostponedTitlesJson;
    }

    public void setRepeatedlyPostponedTitlesJson(String repeatedlyPostponedTitlesJson) {
        this.repeatedlyPostponedTitlesJson = repeatedlyPostponedTitlesJson;
    }

    public String getBehavioralSynthesisJson() {
        return behavioralSynthesisJson;
    }

    public void setBehavioralSynthesisJson(String behavioralSynthesisJson) {
        this.behavioralSynthesisJson = behavioralSynthesisJson;
    }

    public OffsetDateTime getLastSynthesizedAt() {
        return lastSynthesizedAt;
    }

    public void setLastSynthesizedAt(OffsetDateTime lastSynthesizedAt) {
        this.lastSynthesizedAt = lastSynthesizedAt;
    }

    public OffsetDateTime getLastComputedAt() {
        return lastComputedAt;
    }

    public void setLastComputedAt(OffsetDateTime lastComputedAt) {
        this.lastComputedAt = lastComputedAt;
    }
}
