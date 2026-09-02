package com.aazdoh.discussion.service;

import com.aazdoh.commitment.dto.CommitmentResponse;
import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.common.exception.ResourceNotFoundException;
import com.aazdoh.discussion.dto.AddMessageRequest;
import com.aazdoh.discussion.dto.DiscussionMessageDto;
import com.aazdoh.discussion.dto.DiscussionResponse;
import com.aazdoh.discussion.dto.UnreadSummaryDto;
import com.aazdoh.discussion.entity.Discussion;
import com.aazdoh.discussion.entity.DiscussionMessage;
import com.aazdoh.discussion.repository.DiscussionMessageRepository;
import com.aazdoh.discussion.repository.DiscussionRepository;
import com.aazdoh.partnership.repository.PartnershipRepository;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DiscussionService {

    private final DiscussionRepository discussionRepository;
    private final DiscussionMessageRepository discussionMessageRepository;
    private final CommitmentRepository commitmentRepository;
    private final UserService userService;
    private final PartnershipRepository partnershipRepository;

    public DiscussionService(
            DiscussionRepository discussionRepository,
            DiscussionMessageRepository discussionMessageRepository,
            CommitmentRepository commitmentRepository,
            UserService userService,
            PartnershipRepository partnershipRepository
    ) {
        this.discussionRepository = discussionRepository;
        this.discussionMessageRepository = discussionMessageRepository;
        this.commitmentRepository = commitmentRepository;
        this.userService = userService;
        this.partnershipRepository = partnershipRepository;
    }

    @Transactional
    public DiscussionResponse getOrCreateDiscussion(UUID commitmentId, UUID currentUserId) {
        Commitment commitment = commitmentRepository.findActiveById(commitmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Commitment not found: " + commitmentId));

        Discussion discussion = discussionRepository.findByCommitmentId(commitmentId)
                .orElseGet(() -> discussionRepository.save(new Discussion(commitment)));

        // Automatically mark messages from other users as read when opened
        if (currentUserId != null) {
            discussionMessageRepository.markDiscussionAsRead(discussion.getId(), currentUserId, OffsetDateTime.now());
        }

        List<DiscussionMessageDto> messages = discussionMessageRepository
                .findByDiscussionIdOrderByCreatedAtAsc(discussion.getId())
                .stream()
                .map(DiscussionMessageDto::fromEntity)
                .collect(Collectors.toList());

        return new DiscussionResponse(discussion.getId(), commitmentId, messages);
    }

    @Transactional
    public DiscussionMessageDto addMessage(UUID userId, UUID commitmentId, AddMessageRequest request) {
        User author = userService.findUserById(userId);
        Commitment commitment = commitmentRepository.findActiveById(commitmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Commitment not found: " + commitmentId));

        Discussion discussion = discussionRepository.findByCommitmentId(commitmentId)
                .orElseGet(() -> discussionRepository.save(new Discussion(commitment)));

        DiscussionMessage message = new DiscussionMessage(discussion, author, request.getMessage().trim());
        DiscussionMessage saved = discussionMessageRepository.save(message);

        return DiscussionMessageDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public UnreadSummaryDto getUnreadSummary(UUID userId) {
        long unreadDiscussions = discussionMessageRepository.countUnreadMessagesForUser(userId);
        long pendingInvites = partnershipRepository.findPendingIncomingRequests(userId).size();
        return new UnreadSummaryDto(unreadDiscussions, pendingInvites);
    }

    @Transactional(readOnly = true)
    public void populateDiscussionStats(List<CommitmentResponse> responses, UUID currentUserId) {
        if (responses == null || responses.isEmpty() || currentUserId == null) {
            return;
        }

        List<UUID> commitmentIds = responses.stream().map(CommitmentResponse::getId).collect(Collectors.toList());
        List<Object[]> stats = discussionMessageRepository.getStatsForCommitments(commitmentIds, currentUserId);

        Map<UUID, Object[]> statsMap = new HashMap<>();
        for (Object[] row : stats) {
            UUID cid = (UUID) row[0];
            statsMap.put(cid, row);
        }

        for (CommitmentResponse resp : responses) {
            Object[] row = statsMap.get(resp.getId());
            if (row != null) {
                long totalCount = ((Number) row[1]).longValue();
                long unreadCount = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                resp.setDiscussionMessageCount((int) totalCount);
                resp.setHasUnreadDiscussion(unreadCount > 0);
            } else {
                resp.setDiscussionMessageCount(0);
                resp.setHasUnreadDiscussion(false);
            }
        }
    }
}
