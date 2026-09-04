package com.aazdoh.commitment.service;

import com.aazdoh.commitment.dto.CommitmentResponse;
import com.aazdoh.commitment.dto.CreateCommitmentRequest;
import com.aazdoh.commitment.dto.PostponeCommitmentRequest;
import com.aazdoh.commitment.dto.UpdateCommitmentRequest;
import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.common.exception.BadRequestException;
import com.aazdoh.common.exception.ResourceNotFoundException;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CommitmentService {

    private final CommitmentRepository commitmentRepository;
    private final UserService userService;
    private final com.aazdoh.user.repository.UserRepository userRepository;
    private final com.aazdoh.discussion.repository.DiscussionMessageRepository discussionMessageRepository;
    private final com.aazdoh.review.repository.ReviewRepository reviewRepository;

    public CommitmentService(
            CommitmentRepository commitmentRepository,
            UserService userService,
            com.aazdoh.user.repository.UserRepository userRepository,
            com.aazdoh.discussion.repository.DiscussionMessageRepository discussionMessageRepository,
            com.aazdoh.review.repository.ReviewRepository reviewRepository
    ) {
        this.commitmentRepository = commitmentRepository;
        this.userService = userService;
        this.userRepository = userRepository;
        this.discussionMessageRepository = discussionMessageRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional
    public CommitmentResponse createCommitment(UUID userId, CreateCommitmentRequest request) {
        User user = userService.findUserById(userId);

        Commitment commitment = new Commitment();
        commitment.setUser(user);
        commitment.setTitle(request.getTitle().trim());
        commitment.setDescription(request.getDescription());
        commitment.setExpectedOutcome(request.getExpectedOutcome());
        commitment.setEstimatedMinutes(request.getEstimatedMinutes());
        commitment.setPriority(request.getPriority());
        commitment.setCommitmentDate(request.getCommitmentDate());
        commitment.setDeadline(request.getDeadline());
        commitment.setStatus(CommitmentStatus.PENDING);
        commitment.setVisibility(request.getVisibility());
        commitment.setTargetPartnerId(request.getTargetPartnerId());

        Commitment saved = commitmentRepository.save(commitment);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CommitmentResponse> getTodayCommitments(UUID userId, LocalDate date) {
        List<Commitment> list = commitmentRepository.findByUserIdAndCommitmentDate(userId, date);
        Map<UUID, String> partnerNameMap = getPartnerNameMap(list);
        List<CommitmentResponse> responses = list.stream()
                .map(c -> mapToResponse(c, partnerNameMap))
                .collect(Collectors.toList());
        populateDiscussionStats(responses, userId);

        java.util.Set<UUID> reviewedIds = reviewRepository.findReviewedCommitmentIdsByUserIdAndDate(userId, date);
        if (reviewedIds != null && !reviewedIds.isEmpty()) {
            for (CommitmentResponse res : responses) {
                if (reviewedIds.contains(res.getId())) {
                    res.setReviewed(true);
                }
            }
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public List<CommitmentResponse> getCommitmentsByRange(UUID userId, LocalDate startDate, LocalDate endDate) {
        List<Commitment> list = commitmentRepository.findByUserIdAndDateRange(userId, startDate, endDate);
        Map<UUID, String> partnerNameMap = getPartnerNameMap(list);
        return list.stream()
                .map(c -> mapToResponse(c, partnerNameMap))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CommitmentResponse getCommitmentById(UUID userId, UUID commitmentId) {
        Commitment commitment = findActiveCommitment(commitmentId, userId);
        return mapToResponse(commitment);
    }

    @Transactional
    public CommitmentResponse updateCommitment(UUID userId, UUID commitmentId, UpdateCommitmentRequest request) {
        Commitment commitment = findActiveCommitment(commitmentId, userId);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            commitment.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            commitment.setDescription(request.getDescription());
        }
        if (request.getExpectedOutcome() != null) {
            commitment.setExpectedOutcome(request.getExpectedOutcome());
        }
        if (request.getEstimatedMinutes() != null) {
            commitment.setEstimatedMinutes(request.getEstimatedMinutes());
        }
        if (request.getPriority() != null) {
            commitment.setPriority(request.getPriority());
        }
        if (request.getCommitmentDate() != null) {
            commitment.setCommitmentDate(request.getCommitmentDate());
        }
        if (request.getDeadline() != null) {
            commitment.setDeadline(request.getDeadline());
        }
        if (request.getStatus() != null) {
            commitment.setStatus(request.getStatus());
            if (request.getStatus() == CommitmentStatus.COMPLETED && commitment.getCompletedAt() == null) {
                commitment.setCompletedAt(OffsetDateTime.now());
            }
        }
        if (request.getVisibility() != null) {
            commitment.setVisibility(request.getVisibility());
        }
        if (request.getTargetPartnerId() != null) {
            commitment.setTargetPartnerId(request.getTargetPartnerId());
        }

        Commitment updated = commitmentRepository.save(commitment);
        return mapToResponse(updated);
    }

    @Transactional
    public CommitmentResponse completeCommitment(UUID userId, UUID commitmentId) {
        Commitment commitment = findActiveCommitment(commitmentId, userId);
        commitment.setStatus(CommitmentStatus.COMPLETED);
        commitment.setCompletedAt(OffsetDateTime.now());

        // If this was previously postponed, clean up any downstream future copy
        commitmentRepository.findNextPendingPostponedCopy(commitment.getId()).ifPresent(next -> {
            next.setDeletedAt(OffsetDateTime.now());
            commitmentRepository.save(next);
        });

        Commitment updated = commitmentRepository.save(commitment);
        return CommitmentResponse.fromEntity(updated);
    }

    @Transactional
    public CommitmentResponse reopenCommitment(UUID userId, UUID commitmentId) {
        Commitment commitment = findActiveCommitment(commitmentId, userId);
        commitment.setStatus(CommitmentStatus.PENDING);
        commitment.setCompletedAt(null);
        commitment.setPostponeReason(null);

        // Clean up downstream future copy if this was previously postponed
        commitmentRepository.findNextPendingPostponedCopy(commitment.getId()).ifPresent(next -> {
            next.setDeletedAt(OffsetDateTime.now());
            commitmentRepository.save(next);
        });

        Commitment updated = commitmentRepository.save(commitment);
        return CommitmentResponse.fromEntity(updated);
    }

    @Transactional
    public CommitmentResponse postponeCommitment(UUID userId, UUID commitmentId, PostponeCommitmentRequest request) {
        Commitment original = findActiveCommitment(commitmentId, userId);

        if (original.getStatus() == CommitmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot postpone an already completed commitment");
        }

        original.setStatus(CommitmentStatus.POSTPONED);
        if (request.getReason() != null && !request.getReason().isBlank()) {
            original.setPostponeReason(request.getReason());
        }
        commitmentRepository.save(original);

        Commitment next = new Commitment();
        next.setUser(original.getUser());
        next.setTitle(original.getTitle());
        next.setDescription(original.getDescription());
        next.setExpectedOutcome(original.getExpectedOutcome());
        next.setEstimatedMinutes(original.getEstimatedMinutes());
        next.setPriority(original.getPriority());
        next.setCommitmentDate(request.getNewDate());
        next.setVisibility(original.getVisibility());
        next.setStatus(CommitmentStatus.PENDING);
        next.setPostponedFromId(original.getId());
        
        // O(1) lineage tracking: persist permanent origin parent reference
        UUID rootOriginId = original.getOriginCommitmentId() != null ? original.getOriginCommitmentId() : original.getId();
        next.setOriginCommitmentId(rootOriginId);
        next.setPostponementCount(original.getPostponementCount() + 1);

        Commitment savedNew = commitmentRepository.save(next);
        return CommitmentResponse.fromEntity(savedNew);
    }

    @Transactional
    public void deleteCommitment(UUID userId, UUID commitmentId) {
        Commitment commitment = findActiveCommitment(commitmentId, userId);
        commitment.setDeletedAt(OffsetDateTime.now());
        commitmentRepository.save(commitment);
    }

    @Transactional(readOnly = true)
    public Commitment findActiveCommitment(UUID commitmentId, UUID userId) {
        return commitmentRepository.findActiveByIdAndUserId(commitmentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Commitment not found with id: " + commitmentId));
    }

    @Transactional(readOnly = true)
    public List<Commitment> getRecentPostponedCommitments(UUID userId) {
        return commitmentRepository.findRecentPostponedCommitmentsWithReasons(userId);
    }

    private Map<UUID, String> getPartnerNameMap(List<Commitment> commitments) {
        if (commitments == null || commitments.isEmpty()) {
            return java.util.Collections.emptyMap();
        }
        java.util.Set<UUID> partnerIds = commitments.stream()
                .map(Commitment::getTargetPartnerId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
        if (partnerIds.isEmpty()) {
            return java.util.Collections.emptyMap();
        }
        java.util.Map<UUID, String> map = new java.util.HashMap<>();
        userRepository.findAllById(partnerIds).forEach(u -> map.put(u.getId(), u.getFullName()));
        return map;
    }

    private CommitmentResponse mapToResponse(Commitment commitment) {
        return mapToResponse(commitment, null);
    }

    private CommitmentResponse mapToResponse(Commitment commitment, Map<UUID, String> partnerNameMap) {
        CommitmentResponse res = CommitmentResponse.fromEntity(commitment);
        if (commitment.getTargetPartnerId() != null) {
            if (partnerNameMap != null && partnerNameMap.containsKey(commitment.getTargetPartnerId())) {
                res.setTargetPartnerName(partnerNameMap.get(commitment.getTargetPartnerId()));
            } else {
                try {
                    User partner = userService.findUserById(commitment.getTargetPartnerId());
                    res.setTargetPartnerName(partner.getFullName());
                } catch (Exception ignored) {
                }
            }
        }
        return res;
    }

    private void populateDiscussionStats(List<CommitmentResponse> responses, UUID currentUserId) {
        if (responses == null || responses.isEmpty() || currentUserId == null) {
            return;
        }
        List<UUID> ids = responses.stream().map(CommitmentResponse::getId).collect(Collectors.toList());
        List<Object[]> stats = discussionMessageRepository.getStatsForCommitments(ids, currentUserId);
        java.util.Map<UUID, Object[]> statsMap = new java.util.HashMap<>();
        for (Object[] row : stats) {
            statsMap.put((UUID) row[0], row);
        }
        for (CommitmentResponse resp : responses) {
            Object[] row = statsMap.get(resp.getId());
            if (row != null) {
                long total = ((Number) row[1]).longValue();
                long unread = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                resp.setDiscussionMessageCount((int) total);
                resp.setHasUnreadDiscussion(unread > 0);
            } else {
                resp.setDiscussionMessageCount(0);
                resp.setHasUnreadDiscussion(false);
            }
        }
    }
}
