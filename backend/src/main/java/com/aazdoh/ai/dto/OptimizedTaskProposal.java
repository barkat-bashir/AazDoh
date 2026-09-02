package com.aazdoh.ai.dto;

import java.util.UUID;

public class OptimizedTaskProposal {

    private UUID originalCommitmentId;
    private String currentTitle;
    private int currentMinutes;
    private String suggestedAction; // KEEP, TRIM, SPLIT, SHIFT_TO_TOMORROW
    private String proposedTitle;
    private int proposedMinutes;
    private String reasoning;
    private java.util.List<SplitBlockDetail> splitBlocks = new java.util.ArrayList<>();

    public OptimizedTaskProposal() {
    }

    public OptimizedTaskProposal(UUID originalCommitmentId, String currentTitle, int currentMinutes, String suggestedAction, String proposedTitle, int proposedMinutes, String reasoning) {
        this.originalCommitmentId = originalCommitmentId;
        this.currentTitle = currentTitle;
        this.currentMinutes = currentMinutes;
        this.suggestedAction = suggestedAction;
        this.proposedTitle = proposedTitle;
        this.proposedMinutes = proposedMinutes;
        this.reasoning = reasoning;
    }

    public UUID getOriginalCommitmentId() {
        return originalCommitmentId;
    }

    public void setOriginalCommitmentId(UUID originalCommitmentId) {
        this.originalCommitmentId = originalCommitmentId;
    }

    public String getCurrentTitle() {
        return currentTitle;
    }

    public void setCurrentTitle(String currentTitle) {
        this.currentTitle = currentTitle;
    }

    public int getCurrentMinutes() {
        return currentMinutes;
    }

    public void setCurrentMinutes(int currentMinutes) {
        this.currentMinutes = currentMinutes;
    }

    public String getSuggestedAction() {
        return suggestedAction;
    }

    public void setSuggestedAction(String suggestedAction) {
        this.suggestedAction = suggestedAction;
    }

    public String getProposedTitle() {
        return proposedTitle;
    }

    public void setProposedTitle(String proposedTitle) {
        this.proposedTitle = proposedTitle;
    }

    public int getProposedMinutes() {
        return proposedMinutes;
    }

    public void setProposedMinutes(int proposedMinutes) {
        this.proposedMinutes = proposedMinutes;
    }

    public String getReasoning() {
        return reasoning;
    }

    public void setReasoning(String reasoning) {
        this.reasoning = reasoning;
    }

    public java.util.List<SplitBlockDetail> getSplitBlocks() {
        return splitBlocks;
    }

    public void setSplitBlocks(java.util.List<SplitBlockDetail> splitBlocks) {
        this.splitBlocks = splitBlocks;
    }
}
