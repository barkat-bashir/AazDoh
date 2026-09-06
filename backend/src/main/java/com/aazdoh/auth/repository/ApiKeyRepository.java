package com.aazdoh.auth.repository;

import com.aazdoh.auth.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, UUID> {

    @Query("SELECT ak FROM ApiKey ak JOIN FETCH ak.user WHERE ak.keyHash = :keyHash AND ak.revoked = false")
    Optional<ApiKey> findActiveByKeyHash(@Param("keyHash") String keyHash);

    List<ApiKey> findByUserIdAndRevokedFalseOrderByCreatedAtDesc(UUID userId);

    List<ApiKey> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<ApiKey> findByIdAndUserId(UUID id, UUID userId);

    long countByUserIdAndRevokedFalse(UUID userId);
}

