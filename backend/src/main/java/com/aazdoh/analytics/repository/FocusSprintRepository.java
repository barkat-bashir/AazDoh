package com.aazdoh.analytics.repository;

import com.aazdoh.analytics.entity.FocusSprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface FocusSprintRepository extends JpaRepository<FocusSprint, UUID> {

    @Query("SELECT s FROM FocusSprint s WHERE s.user.id = :userId AND s.startedAt BETWEEN :startDate AND :endDate ORDER BY s.startedAt ASC")
    List<FocusSprint> findByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate
    );

    @Query("SELECT s FROM FocusSprint s WHERE s.user.id = :userId AND s.commitment.id = :commitmentId ORDER BY s.startedAt ASC")
    List<FocusSprint> findByUserIdAndCommitmentId(
            @Param("userId") UUID userId,
            @Param("commitmentId") UUID commitmentId
    );

    @Query("SELECT COUNT(s) FROM FocusSprint s WHERE s.user.id = :userId AND s.status = 'COMPLETED' AND s.mode = 'FOCUS' AND s.startedAt BETWEEN :startDate AND :endDate")
    long countCompletedFocusSprints(
            @Param("userId") UUID userId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate
    );
}
