package com.aazdoh.user.entity;

import com.aazdoh.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(length = 50)
    private String timezone = "UTC";

    @Enumerated(EnumType.STRING)
    @Column(name = "ai_persona", length = 20)
    private AiPersona aiPersona = AiPersona.BALANCED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role = UserRole.USER;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    public User() {
    }

    public User(String email, String passwordHash, String fullName, String timezone, AiPersona aiPersona, UserRole role) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.timezone = timezone != null ? timezone : "UTC";
        this.aiPersona = aiPersona != null ? aiPersona : AiPersona.BALANCED;
        this.role = role != null ? role : UserRole.USER;
        this.active = true;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
