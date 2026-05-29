package com.aazdoh.user.dto;

import com.aazdoh.user.entity.AiPersona;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.entity.UserRole;

import java.time.OffsetDateTime;
import java.util.UUID;

public class UserProfileDto {

    private UUID id;
    private String email;
    private String fullName;
    private String timezone;
    private AiPersona aiPersona;
    private UserRole role;
    private OffsetDateTime createdAt;

    public UserProfileDto() {
    }

    public static UserProfileDto fromEntity(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setTimezone(user.getTimezone());
        dto.setAiPersona(user.getAiPersona());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public AiPersona getAiPersona() {
        return aiPersona;
    }

    public void setAiPersona(AiPersona aiPersona) {
        this.aiPersona = aiPersona;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
