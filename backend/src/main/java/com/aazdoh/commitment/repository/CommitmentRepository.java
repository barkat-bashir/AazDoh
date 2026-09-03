package com.aazdoh.commitment.repository;

import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.commitment.entity.CommitmentVisibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommitmentRepository extends JpaRepository<Commitment, UUID> {

    @Query("SELECT c FROM Commitment c JOIN FETCH c.user u WHERE c.id = :id AND c.deletedAt IS NULL")
    Optional<Commitment> findActiveById(@Param("id") UUID id);

    @Query("SELECT c FROM Commitment c JOIN FETCH c.user u WHERE c.id = :id AND c.user.id = :userId AND c.deletedAt IS NULL")
    Optional<Commitment> findActiveByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    @Query("SELECT c FROM Commitment c JOIN FETCH c.user u WHERE c.user.id = :userId AND c.commitmentDate = :date AND c.deletedAt IS NULL ORDER BY c.priority DESC, c.createdAt ASC")
    List<Commitment> findByUserIdAndCommitmentDate(@Param("userId") UUID userId, @Param("date") LocalDate date);

    @Query("SELECT c FROM Commitment c JOIN FETCH c.user u WHERE c.user.id = :userId AND c.commitmentDate BETWEEN :startDate AND :endDate AND c.deletedAt IS NULL ORDER BY c.commitmentDate DESC, c.createdAt ASC")
    List<Commitment> findByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT c FROM Commitment c JOIN FETCH c.user u WHERE c.user.id = :userId AND c.visibility = :visibility AND c.commitmentDate = :date AND c.deletedAt IS NULL ORDER BY c.createdAt ASC")
    List<Commitment> findByUserIdAndVisibilityAndCommitmentDate(
            @Param("userId") UUID userId,
            @Param("visibility") CommitmentVisibility visibility,
            @Param("date") LocalDate date
    );

    @Query("SELECT c FROM Commitment c JOIN FETCH c.user u WHERE c.user.id = :userId AND c.visibility = com.aazdoh.commitment.entity.CommitmentVisibility.SHARED_WITH_PARTNER AND (c.targetPartnerId IS NULL OR c.targetPartnerId = :partnerId) AND c.commitmentDate = :date AND c.deletedAt IS NULL ORDER BY c.createdAt ASC")
    List<Commitment> findSharedCommitmentsForPartner(
            @Param("userId") UUID userId,
            @Param("partnerId") UUID partnerId,
            @Param("date") LocalDate date
    );

    @Query("SELECT c FROM Commitment c WHERE c.user.id = :userId AND c.status = :status AND c.deletedAt IS NULL")
    List<Commitment> findByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") CommitmentStatus status);

    @Query("SELECT COUNT(c) FROM Commitment c WHERE c.user.id = :userId AND c.commitmentDate BETWEEN :startDate AND :endDate AND c.deletedAt IS NULL")
    long countTotalCommitmentsInRange(@Param("userId") UUID userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(c) FROM Commitment c WHERE c.user.id = :userId AND c.status = 'COMPLETED' AND c.commitmentDate BETWEEN :startDate AND :endDate AND c.deletedAt IS NULL")
    long countCompletedCommitmentsInRange(@Param("userId") UUID userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(c) FROM Commitment c WHERE c.user.id = :userId AND c.status = 'MISSED' AND c.commitmentDate BETWEEN :startDate AND :endDate AND c.deletedAt IS NULL")
    long countMissedCommitmentsInRange(@Param("userId") UUID userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT c FROM Commitment c JOIN FETCH c.user u WHERE c.status = 'PENDING' AND c.commitmentDate < :date AND c.deletedAt IS NULL")
    List<Commitment> findOverduePendingCommitments(@Param("date") LocalDate date);

    @Query("SELECT c FROM Commitment c WHERE c.user.id = :userId AND c.postponeReason IS NOT NULL AND c.deletedAt IS NULL ORDER BY c.commitmentDate DESC")
    List<Commitment> findRecentPostponedCommitmentsWithReasons(@Param("userId") UUID userId);

    @Query("SELECT c FROM Commitment c WHERE c.postponedFromId = :originalId AND c.status = 'PENDING' AND c.deletedAt IS NULL")
    Optional<Commitment> findNextPendingPostponedCopy(@Param("originalId") UUID originalId);
}
