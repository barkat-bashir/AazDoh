package com.aazdoh.discussion.dto;

import java.util.List;
import java.util.UUID;

public class UnreadSummaryDto {

    private long unreadDiscussionMessages;
    private long pendingInvitations;
    private long totalUnreadNotifications;

    private long unreadTodayMessages;
    private long unreadPartnerMessages;
    private List<UUID> unreadPartnerIds;
    private List<UUID> unreadCommitmentIds;

    public UnreadSummaryDto() {
    }

    public UnreadSummaryDto(
            long unreadDiscussionMessages,
            long pendingInvitations,
            long unreadTodayMessages,
            long unreadPartnerMessages,
            List<UUID> unreadPartnerIds,
            List<UUID> unreadCommitmentIds
    ) {
        this.unreadDiscussionMessages = unreadDiscussionMessages;
        this.pendingInvitations = pendingInvitations;
        this.totalUnreadNotifications = unreadDiscussionMessages + pendingInvitations;
        this.unreadTodayMessages = unreadTodayMessages;
        this.unreadPartnerMessages = unreadPartnerMessages;
        this.unreadPartnerIds = unreadPartnerIds;
        this.unreadCommitmentIds = unreadCommitmentIds;
    }

    public long getUnreadDiscussionMessages() {
        return unreadDiscussionMessages;
    }

    public void setUnreadDiscussionMessages(long unreadDiscussionMessages) {
        this.unreadDiscussionMessages = unreadDiscussionMessages;
    }

    public long getPendingInvitations() {
        return pendingInvitations;
    }

    public void setPendingInvitations(long pendingInvitations) {
        this.pendingInvitations = pendingInvitations;
    }

    public long getTotalUnreadNotifications() {
        return totalUnreadNotifications;
    }

    public void setTotalUnreadNotifications(long totalUnreadNotifications) {
        this.totalUnreadNotifications = totalUnreadNotifications;
    }

    public long getUnreadTodayMessages() {
        return unreadTodayMessages;
    }

    public void setUnreadTodayMessages(long unreadTodayMessages) {
        this.unreadTodayMessages = unreadTodayMessages;
    }

    public long getUnreadPartnerMessages() {
        return unreadPartnerMessages;
    }

    public void setUnreadPartnerMessages(long unreadPartnerMessages) {
        this.unreadPartnerMessages = unreadPartnerMessages;
    }

    public List<UUID> getUnreadPartnerIds() {
        return unreadPartnerIds;
    }

    public void setUnreadPartnerIds(List<UUID> unreadPartnerIds) {
        this.unreadPartnerIds = unreadPartnerIds;
    }

    public List<UUID> getUnreadCommitmentIds() {
        return unreadCommitmentIds;
    }

    public void setUnreadCommitmentIds(List<UUID> unreadCommitmentIds) {
        this.unreadCommitmentIds = unreadCommitmentIds;
    }
}
