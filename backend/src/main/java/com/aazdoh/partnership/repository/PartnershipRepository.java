package com.aazdoh.partnership.repository;

import com.aazdoh.partnership.entity.AccountabilityPartnership;
import com.aazdoh.partnership.entity.PartnershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PartnershipRepository extends JpaRepository<AccountabilityPartnership, UUID> {

    @Query("SELECT p FROM AccountabilityPartnership p JOIN FETCH p.requester JOIN FETCH p.partner WHERE (p.requester.id = :userId OR p.partner.id = :userId) AND p.status = :status")
    List<AccountabilityPartnership> findAllByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") PartnershipStatus status);

    @Query("SELECT p FROM AccountabilityPartnership p JOIN FETCH p.requester JOIN FETCH p.partner WHERE ((p.requester.id = :u1 AND p.partner.id = :u2) OR (p.requester.id = :u2 AND p.partner.id = :u1)) AND p.status <> 'TERMINATED'")
    Optional<AccountabilityPartnership> findActiveBetween(@Param("u1") UUID u1, @Param("u2") UUID u2);

    @Query("SELECT p FROM AccountabilityPartnership p JOIN FETCH p.requester JOIN FETCH p.partner WHERE p.partner.id = :userId AND p.status = 'PENDING'")
    List<AccountabilityPartnership> findPendingIncomingRequests(@Param("userId") UUID userId);

    @Query("SELECT p FROM AccountabilityPartnership p JOIN FETCH p.requester JOIN FETCH p.partner WHERE p.requester.id = :userId AND p.status = 'PENDING'")
    List<AccountabilityPartnership> findPendingOutgoingRequests(@Param("userId") UUID userId);

    long countByPartnerIdAndStatus(UUID partnerId, PartnershipStatus status);
}
