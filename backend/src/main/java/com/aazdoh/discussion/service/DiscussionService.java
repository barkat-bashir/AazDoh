package com.aazdoh.discussion.service;

import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.common.exception.ResourceNotFoundException;
import com.aazdoh.discussion.dto.AddMessageRequest;
import com.aazdoh.discussion.dto.DiscussionMessageDto;
import com.aazdoh.discussion.dto.DiscussionResponse;
import com.aazdoh.discussion.entity.Discussion;
import com.aazdoh.discussion.entity.DiscussionMessage;
import com.aazdoh.discussion.repository.DiscussionMessageRepository;
import com.aazdoh.discussion.repository.DiscussionRepository;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DiscussionService {

    private final DiscussionRepository discussionRepository;
    private final DiscussionMessageRepository discussionMessageRepository;
    private final CommitmentRepository commitmentRepository;
    private final UserService userService;

    public DiscussionService(
            DiscussionRepository discussionRepository,
            DiscussionMessageRepository discussionMessageRepository,
            CommitmentRepository commitmentRepository,
            UserService userService
    ) {
        this.discussionRepository = discussionRepository;
        this.discussionMessageRepository = discussionMessageRepository;
        this.commitmentRepository = commitmentRepository;
        this.userService = userService;
    }

    @Transactional
    public DiscussionResponse getOrCreateDiscussion(UUID commitmentId) {
        Commitment commitment = commitmentRepository.findActiveById(commitmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Commitment not found: " + commitmentId));

        Discussion discussion = discussionRepository.findByCommitmentId(commitmentId)
                .orElseGet(() -> discussionRepository.save(new Discussion(commitment)));

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
}
