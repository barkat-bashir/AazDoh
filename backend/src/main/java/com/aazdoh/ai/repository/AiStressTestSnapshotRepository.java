package com.aazdoh.ai.repository;

import com.aazdoh.ai.entity.AiStressTestSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiStressTestSnapshotRepository extends JpaRepository<AiStressTestSnapshot, UUID> {

    Optional<AiStressTestSnapshot> findFirstByUserIdAndCommitmentDateAndPlanHash(
            UUID userId,
            LocalDate commitmentDate,
            String planHash
    );

    Optional<AiStressTestSnapshot> findFirstByUserIdAndCommitmentDateOrderByCreatedAtDesc(
            UUID userId,
            LocalDate commitmentDate
    );
}
