package com.aazdoh.partnership.dto;

import com.aazdoh.partnership.entity.PartnershipType;

public class UpdatePartnershipRequest {

    private PartnershipType partnershipType;
    private Boolean shareMyCommitments;
    private Boolean sharePartnerCommitments;

    public UpdatePartnershipRequest() {
    }

    public UpdatePartnershipRequest(PartnershipType partnershipType, Boolean shareMyCommitments) {
        this.partnershipType = partnershipType;
        this.shareMyCommitments = shareMyCommitments;
    }

    public PartnershipType getPartnershipType() {
        return partnershipType;
    }

    public void setPartnershipType(PartnershipType partnershipType) {
        this.partnershipType = partnershipType;
    }

    public Boolean getShareMyCommitments() {
        return shareMyCommitments != null ? shareMyCommitments : sharePartnerCommitments;
    }

    public void setShareMyCommitments(Boolean shareMyCommitments) {
        this.shareMyCommitments = shareMyCommitments;
    }

    public Boolean getSharePartnerCommitments() {
        return sharePartnerCommitments;
    }

    public void setSharePartnerCommitments(Boolean sharePartnerCommitments) {
        this.sharePartnerCommitments = sharePartnerCommitments;
    }
}
