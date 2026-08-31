package com.aazdoh.ai.dto;

import java.util.List;

public class ApplyOptimizedPlanRequest {

    private List<OptimizedTaskProposal> acceptedProposals;

    public ApplyOptimizedPlanRequest() {
    }

    public ApplyOptimizedPlanRequest(List<OptimizedTaskProposal> acceptedProposals) {
        this.acceptedProposals = acceptedProposals;
    }

    public List<OptimizedTaskProposal> getAcceptedProposals() {
        return acceptedProposals;
    }

    public void setAcceptedProposals(List<OptimizedTaskProposal> acceptedProposals) {
        this.acceptedProposals = acceptedProposals;
    }
}
