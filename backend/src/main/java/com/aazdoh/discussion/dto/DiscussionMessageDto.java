package com.aazdoh.discussion.dto;

import com.aazdoh.discussion.entity.DiscussionMessage;

import java.time.OffsetDateTime;
import java.util.UUID;

public class DiscussionMessageDto {

    private UUID id;
    private UUID authorId;
    private String authorFullName;
    private String message;
    private OffsetDateTime createdAt;

    public DiscussionMessageDto() {
    }

    public static DiscussionMessageDto fromEntity(DiscussionMessage msg) {
        DiscussionMessageDto dto = new DiscussionMessageDto();
        dto.setId(msg.getId());
        dto.setAuthorId(msg.getAuthor().getId());
        dto.setAuthorFullName(msg.getAuthor().getFullName());
        dto.setMessage(msg.getMessage());
        dto.setCreatedAt(msg.getCreatedAt());
        return dto;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getAuthorId() {
        return authorId;
    }

    public void setAuthorId(UUID authorId) {
        this.authorId = authorId;
    }

    public String getAuthorFullName() {
        return authorFullName;
    }

    public void setAuthorFullName(String authorFullName) {
        this.authorFullName = authorFullName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
