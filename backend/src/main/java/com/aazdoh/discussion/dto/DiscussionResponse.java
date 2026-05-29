package com.aazdoh.discussion.dto;

import java.util.List;
import java.util.UUID;

public class DiscussionResponse {

    private UUID id;
    private UUID commitmentId;
    private List<DiscussionMessageDto> messages;

    public DiscussionResponse() {
    }

    public DiscussionResponse(UUID id, UUID commitmentId, List<DiscussionMessageDto> messages) {
        this.id = id;
        this.commitmentId = commitmentId;
        this.messages = messages;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCommitmentId() {
        return commitmentId;
    }

    public void setCommitmentId(UUID commitmentId) {
        this.commitmentId = commitmentId;
    }

    public List<DiscussionMessageDto> getMessages() {
        return messages;
    }

    public void setMessages(List<DiscussionMessageDto> messages) {
        this.messages = messages;
    }
}
