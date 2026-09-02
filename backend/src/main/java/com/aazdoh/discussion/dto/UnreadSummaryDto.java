package com.aazdoh.discussion.dto;

public class UnreadSummaryDto {

    private long unreadDiscussionMessages;
    private long pendingInvitations;
    private long totalUnreadNotifications;

    public UnreadSummaryDto() {
    }

    public UnreadSummaryDto(long unreadDiscussionMessages, long pendingInvitations) {
        this.unreadDiscussionMessages = unreadDiscussionMessages;
        this.pendingInvitations = pendingInvitations;
        this.totalUnreadNotifications = unreadDiscussionMessages + pendingInvitations;
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
}
