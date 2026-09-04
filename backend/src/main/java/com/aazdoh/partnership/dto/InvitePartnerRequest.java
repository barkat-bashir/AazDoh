package com.aazdoh.partnership.dto;

import com.aazdoh.partnership.entity.PartnershipType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class InvitePartnerRequest {

    @NotBlank(message = "Partner email is required")
    @Email(message = "Invalid email format")
    private String partnerEmail;
    private PartnershipType partnershipType = PartnershipType.MUTUAL;

    public InvitePartnerRequest() {
    }

    public InvitePartnerRequest(String partnerEmail) {
        this.partnerEmail = partnerEmail;
        this.partnershipType = PartnershipType.MUTUAL;
    }

    public InvitePartnerRequest(String partnerEmail, PartnershipType partnershipType) {
        this.partnerEmail = partnerEmail;
        this.partnershipType = partnershipType != null ? partnershipType : PartnershipType.MUTUAL;
    }

    public String getPartnerEmail() {
        return partnerEmail;
    }

    public void setPartnerEmail(String partnerEmail) {
        this.partnerEmail = partnerEmail;
    }

    public PartnershipType getPartnershipType() {
        return partnershipType;
    }

    public void setPartnershipType(PartnershipType partnershipType) {
        this.partnershipType = partnershipType;
    }
}
