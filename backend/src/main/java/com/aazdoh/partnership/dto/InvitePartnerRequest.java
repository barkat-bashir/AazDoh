package com.aazdoh.partnership.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class InvitePartnerRequest {

    @NotBlank(message = "Partner email is required")
    @Email(message = "Invalid email format")
    private String partnerEmail;
    private com.aazdoh.partnership.entity.PartnershipType partnershipType = com.aazdoh.partnership.entity.PartnershipType.MUTUAL;

    public InvitePartnerRequest() {
    }

    public InvitePartnerRequest(String partnerEmail) {
        this.partnerEmail = partnerEmail;
        this.partnershipType = com.aazdoh.partnership.entity.PartnershipType.MUTUAL;
    }

    public InvitePartnerRequest(String partnerEmail, com.aazdoh.partnership.entity.PartnershipType partnershipType) {
        this.partnerEmail = partnerEmail;
        this.partnershipType = partnershipType != null ? partnershipType : com.aazdoh.partnership.entity.PartnershipType.MUTUAL;
    }

    public String getPartnerEmail() {
        return partnerEmail;
    }

    public void setPartnerEmail(String partnerEmail) {
        this.partnerEmail = partnerEmail;
    }

    public com.aazdoh.partnership.entity.PartnershipType getPartnershipType() {
        return partnershipType;
    }

    public void setPartnershipType(com.aazdoh.partnership.entity.PartnershipType partnershipType) {
        this.partnershipType = partnershipType;
    }
}
