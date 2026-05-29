package com.aazdoh.partnership.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class InvitePartnerRequest {

    @NotBlank(message = "Partner email is required")
    @Email(message = "Invalid email format")
    private String partnerEmail;

    public InvitePartnerRequest() {
    }

    public InvitePartnerRequest(String partnerEmail) {
        this.partnerEmail = partnerEmail;
    }

    public String getPartnerEmail() {
        return partnerEmail;
    }

    public void setPartnerEmail(String partnerEmail) {
        this.partnerEmail = partnerEmail;
    }
}
