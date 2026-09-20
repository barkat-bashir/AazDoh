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

    @Query("SELECT c, " +
           "  (SELECT COUNT(cr.id) > 0 FROM CommitmentReview cr WHERE cr.commitment.id = c.id), " +
           "  (SELECT COUNT(dm.id) FROM DiscussionMessage dm WHERE dm.discussion.commitment.id = c.id), " +
           "  (SELECT COUNT(dm2.id) FROM DiscussionMessage dm2 WHERE dm2.discussion.commitment.id = c.id AND dm2.author.id != :userId AND dm2.readAt IS NULL) " +
           "FROM Commitment c JOIN FETCH c.user u " +
           "WHERE c.user.id = :userId AND c.commitmentDate = :date AND c.deletedAt IS NULL " +
           "ORDER BY c.priority DESC, c.createdAt ASC")
    List<Object[]> findEnrichedByUserIdAndCommitmentDate(
            @Param("userId") UUID userId,
            @Param("date") LocalDate date
    );

    @Query("SELECT c FROM Commitment c JOIN FETCH c.user u WHERE c.user.id = :userId AND c.commitmentDate BETWEEN :startDate AND :endDate AND c.deletedAt IS NULL ORDER BY c.commitmentDate DESC, c.createdAt ASC")
    List<Commitment> findByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT c, " +
           "  (SELECT COUNT(cr.id) > 0 FROM CommitmentReview cr WHERE cr.commitment.id = c.id), " +
           "  (SELECT COUNT(dm.id) FROM DiscussionMessage dm WHERE dm.discussion.commitment.id = c.id), " +
           "  (SELECT COUNT(dm2.id) FROM DiscussionMessage dm2 WHERE dm2.discussion.commitment.id = c.id AND dm2.author.id != :userId AND dm2.readAt IS NULL) " +
           "FROM Commitment c JOIN FETCH c.user u " +
           "WHERE c.user.id = :userId AND c.commitmentDate BETWEEN :startDate AND :endDate AND c.deletedAt IS NULL " +
           "ORDER BY c.commitmentDate DESC, c.createdAt ASC")
    List<Object[]> findEnrichedByUserIdAndDateRange(
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

    @Query("SELECT c FROM Commitment c JOIN FETCH c.user u WHERE c.status = 'PENDING' AND c.commitmentDate < :date AND c.deletedAt IS NULL")
    List<Commitment> findOverduePendingCommitments(@Param("date") LocalDate date);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Commitment c SET c.status = com.aazdoh.commitment.entity.CommitmentStatus.MISSED WHERE c.user.id = :userId AND c.status = com.aazdoh.commitment.entity.CommitmentStatus.PENDING AND c.commitmentDate < :userToday AND c.deletedAt IS NULL")
    int rolloverOverdueForUser(@Param("userId") UUID userId, @Param("userToday") LocalDate userToday);

    @Query("SELECT c FROM Commitment c WHERE c.user.id = :userId AND c.postponeReason IS NOT NULL AND c.deletedAt IS NULL ORDER BY c.commitmentDate DESC")
    List<Commitment> findRecentPostponedCommitmentsWithReasons(@Param("userId") UUID userId);

    @Query("SELECT c FROM Commitment c WHERE c.postponedFromId = :originalId AND c.status = 'PENDING' AND c.deletedAt IS NULL")
    Optional<Commitment> findNextPendingPostponedCopy(@Param("originalId") UUID originalId);

    @Query("SELECT COUNT(c), " +
           "SUM(CASE WHEN c.status = com.aazdoh.commitment.entity.CommitmentStatus.COMPLETED THEN 1L ELSE 0L END), " +
           "SUM(CASE WHEN c.status = com.aazdoh.commitment.entity.CommitmentStatus.COMPLETED THEN c.estimatedMinutes ELSE 0 END) " +
           "FROM Commitment c WHERE c.user.id = :userId AND c.commitmentDate BETWEEN :startDate AND :endDate AND c.deletedAt IS NULL")
    List<Object[]> aggregateStatsByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT DISTINCT c.title FROM Commitment c WHERE c.user.id = :userId AND c.commitmentDate BETWEEN :startDate AND :endDate AND (c.postponedFromId IS NOT NULL OR c.status = com.aazdoh.commitment.entity.CommitmentStatus.POSTPONED) AND c.deletedAt IS NULL")
    List<String> findPostponedTitlesByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
