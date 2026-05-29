package com.aazdoh.partnership.dto;

import com.aazdoh.partnership.entity.AccountabilityPartnership;
import com.aazdoh.partnership.entity.PartnershipStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public class PartnershipResponse {

    private UUID id;
    private UUID requesterId;
    private String requesterName;
    private String requesterEmail;
    private UUID partnerId;
    private String partnerName;
    private String partnerEmail;
    private PartnershipStatus status;
    private OffsetDateTime createdAt;

    public PartnershipResponse() {
    }

    public static PartnershipResponse fromEntity(AccountabilityPartnership p) {
        PartnershipResponse res = new PartnershipResponse();
        res.setId(p.getId());
        res.setRequesterId(p.getRequester().getId());
        res.setRequesterName(p.getRequester().getFullName());
        res.setRequesterEmail(p.getRequester().getEmail());
        res.setPartnerId(p.getPartner().getId());
        res.setPartnerName(p.getPartner().getFullName());
        res.setPartnerEmail(p.getPartner().getEmail());
        res.setStatus(p.getStatus());
        res.setCreatedAt(p.getCreatedAt());
        return res;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(UUID requesterId) {
        this.requesterId = requesterId;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public String getRequesterEmail() {
        return requesterEmail;
    }

    public void setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
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

    public String getPartnerEmail() {
        return partnerEmail;
    }

    public void setPartnerEmail(String partnerEmail) {
        this.partnerEmail = partnerEmail;
    }

    public PartnershipStatus getStatus() {
        return status;
    }

    public void setStatus(PartnershipStatus status) {
        this.status = status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
