package com.aazdoh.partnership.dto;

import com.aazdoh.commitment.dto.CommitmentResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class PartnerDailyOverviewDto {

    private UUID partnerId;
    private String partnerName;
    private LocalDate date;
    private List<CommitmentResponse> sharedCommitments;
    private int totalCommitments;
    private int completedCommitments;
    private double completionRate;

    public PartnerDailyOverviewDto() {
    }

    public PartnerDailyOverviewDto(UUID partnerId, String partnerName, LocalDate date, List<CommitmentResponse> sharedCommitments) {
        this.partnerId = partnerId;
        this.partnerName = partnerName;
        this.date = date;
        this.sharedCommitments = sharedCommitments;
        this.totalCommitments = sharedCommitments.size();
        this.completedCommitments = (int) sharedCommitments.stream().filter(c -> c.getStatus().name().equals("COMPLETED")).count();
        this.completionRate = totalCommitments > 0 ? (double) completedCommitments / totalCommitments * 100.0 : 0.0;
    }

    public UUID getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(UUID partnerId) {
        this.partnerId = partnerId;
    }

    public String getPartnerName() {
        return partnerName;
    }

    public void setPartnerName(String partnerName) {
        this.partnerName = partnerName;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public List<CommitmentResponse> getSharedCommitments() {
        return sharedCommitments;
    }

    public void setSharedCommitments(List<CommitmentResponse> sharedCommitments) {
        this.sharedCommitments = sharedCommitments;
    }

    public int getTotalCommitments() {
        return totalCommitments;
    }

    public void setTotalCommitments(int totalCommitments) {
        this.totalCommitments = totalCommitments;
    }

    public int getCompletedCommitments() {
        return completedCommitments;
    }

    public void setCompletedCommitments(int completedCommitments) {
        this.completedCommitments = completedCommitments;
    }

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }
}
