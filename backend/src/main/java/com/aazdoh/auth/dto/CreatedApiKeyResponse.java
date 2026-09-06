package com.aazdoh.auth.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class CreatedApiKeyResponse {

    private UUID id;
    private String name;
    private String rawKey;
    private String keyPrefix;
    private OffsetDateTime expiresAt;
    private OffsetDateTime createdAt;

    public CreatedApiKeyResponse() {
    }

    public CreatedApiKeyResponse(UUID id, String name, String rawKey, String keyPrefix, OffsetDateTime expiresAt, OffsetDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.rawKey = rawKey;
        this.keyPrefix = keyPrefix;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
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

    public String getRawKey() {
        return rawKey;
    }

    public void setRawKey(String rawKey) {
        this.rawKey = rawKey;
    }

    public String getKeyPrefix() {
        return keyPrefix;
    }

    public void setKeyPrefix(String keyPrefix) {
        this.keyPrefix = keyPrefix;
    }

    public OffsetDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(OffsetDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
