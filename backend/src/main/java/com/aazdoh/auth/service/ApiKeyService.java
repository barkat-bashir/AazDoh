package com.aazdoh.auth.service;

import com.aazdoh.auth.dto.ApiKeyResponse;
import com.aazdoh.auth.dto.CreateApiKeyRequest;
import com.aazdoh.auth.dto.CreatedApiKeyResponse;
import com.aazdoh.auth.entity.ApiKey;
import com.aazdoh.auth.repository.ApiKeyRepository;
import com.aazdoh.common.exception.BadRequestException;
import com.aazdoh.common.exception.ResourceNotFoundException;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ApiKeyService {

    private static final Logger log = LoggerFactory.getLogger(ApiKeyService.class);
    private static final String API_KEY_PREFIX = "aazdoh_live_";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final ApiKeyRepository apiKeyRepository;
    private final UserRepository userRepository;

    public ApiKeyService(ApiKeyRepository apiKeyRepository, UserRepository userRepository) {
        this.apiKeyRepository = apiKeyRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CreatedApiKeyResponse generateApiKey(UUID userId, CreateApiKeyRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        long activeKeyCount = apiKeyRepository.countByUserIdAndRevokedFalse(userId);
        if (activeKeyCount >= 20) {
            throw new BadRequestException("Maximum active API keys limit (20) reached. Please revoke unused keys.");
        }

        // Generate high-entropy raw key
        byte[] randomBytes = new byte[16];
        SECURE_RANDOM.nextBytes(randomBytes);
        StringBuilder randomHex = new StringBuilder();
        for (byte b : randomBytes) {
            randomHex.append(String.format("%02x", b));
        }

        String rawKey = API_KEY_PREFIX + UUID.randomUUID().toString().replace("-", "") + randomHex;
        String keyHash = hashKey(rawKey);
        String keyPrefix = rawKey.substring(0, 20) + "...";

        OffsetDateTime expiresAt = null;
        if (request.getExpiresInDays() != null && request.getExpiresInDays() > 0) {
            expiresAt = OffsetDateTime.now().plusDays(request.getExpiresInDays());
        }

        ApiKey apiKey = new ApiKey(user, request.getName().trim(), keyPrefix, keyHash, expiresAt);
        ApiKey saved = apiKeyRepository.save(apiKey);

        log.info("Generated new API key '{}' ({}) for user {}", saved.getName(), keyPrefix, userId);

        return new CreatedApiKeyResponse(
                saved.getId(),
                saved.getName(),
                rawKey,
                saved.getKeyPrefix(),
                saved.getExpiresAt(),
                saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<ApiKeyResponse> listUserApiKeys(UUID userId) {
        return apiKeyRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ApiKeyResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void revokeApiKey(UUID userId, UUID keyId) {
        ApiKey apiKey = apiKeyRepository.findByIdAndUserId(keyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("API key not found"));

        apiKey.setRevoked(true);
        apiKeyRepository.save(apiKey);
        log.info("Revoked API key {} for user {}", keyId, userId);
    }

    @Transactional
    public Optional<User> validateKeyAndGetUser(String rawKey) {
        if (rawKey == null || !rawKey.startsWith(API_KEY_PREFIX)) {
            return Optional.empty();
        }

        String keyHash = hashKey(rawKey.trim());
        Optional<ApiKey> keyOpt = apiKeyRepository.findActiveByKeyHash(keyHash);

        if (keyOpt.isEmpty()) {
            return Optional.empty();
        }

        ApiKey apiKey = keyOpt.get();
        if (!apiKey.isValid()) {
            return Optional.empty();
        }

        // Update lastUsedAt timestamp
        apiKey.setLastUsedAt(OffsetDateTime.now());
        apiKeyRepository.save(apiKey);

        return Optional.of(apiKey.getUser());
    }

    public static String hashKey(String rawKey) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error computing SHA-256 hash for API key", e);
        }
    }
}
