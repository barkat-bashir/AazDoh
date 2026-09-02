package com.aazdoh.partnership.entity;

import com.aazdoh.common.entity.BaseEntity;
import com.aazdoh.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "accountability_partnerships", uniqueConstraints = {
        @UniqueConstraint(name = "uq_partnership", columnNames = {"requester_id", "partner_id"})
})
public class AccountabilityPartnership extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "partner_id", nullable = false)
    private User partner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PartnershipStatus status = PartnershipStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "partnership_type", nullable = false, length = 30)
    private PartnershipType partnershipType = PartnershipType.MUTUAL;

    @Column(name = "share_partner_commitments", nullable = false)
    private boolean sharePartnerCommitments = true;

    public AccountabilityPartnership() {
    }

    public AccountabilityPartnership(User requester, User partner) {
        this(requester, partner, PartnershipType.MUTUAL, true);
    }

    public AccountabilityPartnership(User requester, User partner, PartnershipType partnershipType, boolean sharePartnerCommitments) {
        this.requester = requester;
        this.partner = partner;
        this.status = PartnershipStatus.PENDING;
        this.partnershipType = partnershipType != null ? partnershipType : PartnershipType.MUTUAL;
        this.sharePartnerCommitments = sharePartnerCommitments;
    }

    public PartnershipType getPartnershipType() {
        return partnershipType;
    }

    public void setPartnershipType(PartnershipType partnershipType) {
        this.partnershipType = partnershipType;
    }

    public boolean isSharePartnerCommitments() {
        return sharePartnerCommitments;
    }

    public void setSharePartnerCommitments(boolean sharePartnerCommitments) {
        this.sharePartnerCommitments = sharePartnerCommitments;
    }

    public User getRequester() {
        return requester;
    }

    public void setRequester(User requester) {
        this.requester = requester;
    }

    public User getPartner() {
        return partner;
    }

    public void setPartner(User partner) {
        this.partner = partner;
    }

    public PartnershipStatus getStatus() {
        return status;
    }

    public void setStatus(PartnershipStatus status) {
        this.status = status;
    }
}
