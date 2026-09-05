package com.aazdoh.analytics.repository;

import com.aazdoh.analytics.entity.UserExecutionStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserExecutionStatsRepository extends JpaRepository<UserExecutionStats, UUID> {

    @Query("SELECT s FROM UserExecutionStats s JOIN FETCH s.user u WHERE s.user.id = :userId")
    Optional<UserExecutionStats> findByUserId(@Param("userId") UUID userId);
}
