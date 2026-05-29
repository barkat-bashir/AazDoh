package com.aazdoh.user.service;

import com.aazdoh.common.exception.ResourceNotFoundException;
import com.aazdoh.user.dto.UpdatePreferencesRequest;
import com.aazdoh.user.dto.UserProfileDto;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserProfileDto getUserProfile(UUID userId) {
        User user = findUserById(userId);
        return UserProfileDto.fromEntity(user);
    }

    @Transactional
    public UserProfileDto updatePreferences(UUID userId, UpdatePreferencesRequest request) {
        User user = findUserById(userId);

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getTimezone() != null && !request.getTimezone().isBlank()) {
            user.setTimezone(request.getTimezone().trim());
        }
        if (request.getAiPersona() != null) {
            user.setAiPersona(request.getAiPersona());
        }

        User updated = userRepository.save(user);
        return UserProfileDto.fromEntity(updated);
    }

    public User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
}
