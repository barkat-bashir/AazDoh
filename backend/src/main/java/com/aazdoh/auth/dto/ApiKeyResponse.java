package com.aazdoh.auth.dto;

import com.aazdoh.auth.entity.ApiKey;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ApiKeyResponse {

    private UUID id;
    private String name;
    private String keyPrefix;
    private OffsetDateTime lastUsedAt;
    private OffsetDateTime expiresAt;
    private boolean revoked;
    private OffsetDateTime createdAt;

    public ApiKeyResponse() {
    }

    public ApiKeyResponse(UUID id, String name, String keyPrefix, OffsetDateTime lastUsedAt, OffsetDateTime expiresAt, boolean revoked, OffsetDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.keyPrefix = keyPrefix;
        this.lastUsedAt = lastUsedAt;
        this.expiresAt = expiresAt;
        this.revoked = revoked;
        this.createdAt = createdAt;
    }

    public static ApiKeyResponse fromEntity(ApiKey apiKey) {
        return new ApiKeyResponse(
                apiKey.getId(),
                apiKey.getName(),
                apiKey.getKeyPrefix(),
                apiKey.getLastUsedAt(),
                apiKey.getExpiresAt(),
                apiKey.isRevoked(),
                apiKey.getCreatedAt()
        );
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getKeyPrefix() {
        return keyPrefix;
    }

    public void setKeyPrefix(String keyPrefix) {
        this.keyPrefix = keyPrefix;
    }

    public OffsetDateTime getLastUsedAt() {
        return lastUsedAt;
    }

    public void setLastUsedAt(OffsetDateTime lastUsedAt) {
        this.lastUsedAt = lastUsedAt;
    }

    public OffsetDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(OffsetDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isRevoked() {
        return revoked;
    }

    public void setRevoked(boolean revoked) {
        this.revoked = revoked;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
