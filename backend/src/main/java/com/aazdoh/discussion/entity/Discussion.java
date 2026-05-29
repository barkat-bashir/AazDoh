package com.aazdoh.discussion.entity;

import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "discussions")
public class Discussion extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "commitment_id", nullable = false, unique = true)
    private Commitment commitment;

    public Discussion() {
    }

    public Discussion(Commitment commitment) {
        this.commitment = commitment;
    }

    public Commitment getCommitment() {
        return commitment;
    }

    public void setCommitment(Commitment commitment) {
        this.commitment = commitment;
    }
}
