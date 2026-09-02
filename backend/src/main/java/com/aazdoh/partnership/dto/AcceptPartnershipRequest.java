package com.aazdoh.partnership.dto;

public class AcceptPartnershipRequest {

    private Boolean shareMyCommitments;

    public AcceptPartnershipRequest() {
    }

    public AcceptPartnershipRequest(Boolean shareMyCommitments) {
        this.shareMyCommitments = shareMyCommitments;
    }

    public Boolean getShareMyCommitments() {
        return shareMyCommitments;
    }

    public void setShareMyCommitments(Boolean shareMyCommitments) {
        this.shareMyCommitments = shareMyCommitments;
    }
}
