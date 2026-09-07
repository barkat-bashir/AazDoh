package com.aazdoh.ai.repository;

import com.aazdoh.ai.entity.AgentActionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AgentActionLogRepository extends JpaRepository<AgentActionLog, UUID> {

    List<AgentActionLog> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<AgentActionLog> findFirstByUserIdAndUndoneFalseOrderByCreatedAtDesc(UUID userId);

    Optional<AgentActionLog> findByIdAndUserId(UUID id, UUID userId);
}
