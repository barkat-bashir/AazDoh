package com.aazdoh.discussion.entity;

import com.aazdoh.common.entity.BaseEntity;
import com.aazdoh.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "discussion_messages")
public class DiscussionMessage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "discussion_id", nullable = false)
    private Discussion discussion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "read_at")
    private java.time.OffsetDateTime readAt;

    public DiscussionMessage() {
    }

    public DiscussionMessage(Discussion discussion, User author, String message) {
        this.discussion = discussion;
        this.author = author;
        this.message = message;
    }

    public Discussion getDiscussion() {
        return discussion;
    }

    public void setDiscussion(Discussion discussion) {
        this.discussion = discussion;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public java.time.OffsetDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(java.time.OffsetDateTime readAt) {
        this.readAt = readAt;
    }
}
