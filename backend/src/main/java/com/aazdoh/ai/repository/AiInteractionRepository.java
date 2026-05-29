package com.aazdoh.ai.repository;

import com.aazdoh.ai.entity.AiInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiInteractionRepository extends JpaRepository<AiInteraction, UUID> {
    List<AiInteraction> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
