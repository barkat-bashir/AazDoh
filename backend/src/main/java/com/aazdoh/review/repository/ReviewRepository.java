package com.aazdoh.review.repository;

import com.aazdoh.review.entity.CommitmentReview;
import com.aazdoh.review.entity.FailureReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<CommitmentReview, UUID> {

    Optional<CommitmentReview> findByCommitmentId(UUID commitmentId);

    @Query("SELECT r FROM CommitmentReview r WHERE r.commitment.user.id = :userId ORDER BY r.reviewedAt DESC")
    List<CommitmentReview> findRecentReviewsByUserId(@Param("userId") UUID userId);

    @Query("SELECT r FROM CommitmentReview r WHERE r.commitment.user.id = :userId AND r.commitment.commitmentDate BETWEEN :startDate AND :endDate")
    List<CommitmentReview> findByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT r.failureReason, COUNT(r) FROM CommitmentReview r WHERE r.commitment.user.id = :userId AND r.failureReason IS NOT NULL GROUP BY r.failureReason ORDER BY COUNT(r) DESC")
    List<Object[]> countFailureReasonsByUserId(@Param("userId") UUID userId);

    @Query("SELECT r.commitment.id FROM CommitmentReview r WHERE r.commitment.user.id = :userId AND r.commitment.commitmentDate = :date")
    java.util.Set<UUID> findReviewedCommitmentIdsByUserIdAndDate(@Param("userId") UUID userId, @Param("date") LocalDate date);
}
