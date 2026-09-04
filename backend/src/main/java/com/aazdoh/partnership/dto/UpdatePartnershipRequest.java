package com.aazdoh.partnership.dto;

import com.aazdoh.partnership.entity.PartnershipType;

public class UpdatePartnershipRequest {

    private PartnershipType partnershipType;
    private Boolean sharePartnerCommitments;

    public UpdatePartnershipRequest() {
    }

    public UpdatePartnershipRequest(PartnershipType partnershipType, Boolean sharePartnerCommitments) {
        this.partnershipType = partnershipType;
        this.sharePartnerCommitments = sharePartnerCommitments;
    }

    public PartnershipType getPartnershipType() {
        return partnershipType;
    }

    public void setPartnershipType(PartnershipType partnershipType) {
        this.partnershipType = partnershipType;
    }

    public Boolean getSharePartnerCommitments() {
        return sharePartnerCommitments;
    }

    public void setSharePartnerCommitments(Boolean sharePartnerCommitments) {
        this.sharePartnerCommitments = sharePartnerCommitments;
    }
}
