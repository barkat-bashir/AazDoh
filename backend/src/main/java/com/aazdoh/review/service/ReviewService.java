package com.aazdoh.review.service;

import com.aazdoh.analytics.service.UserExecutionStatsService;
import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.commitment.service.CommitmentService;
import com.aazdoh.common.exception.BadRequestException;
import com.aazdoh.common.exception.ResourceNotFoundException;
import com.aazdoh.review.dto.ReviewCommitmentRequest;
import com.aazdoh.review.dto.ReviewResponse;
import com.aazdoh.review.entity.CommitmentReview;
import com.aazdoh.review.entity.NextAction;
import com.aazdoh.review.repository.ReviewRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final CommitmentRepository commitmentRepository;
    private final CommitmentService commitmentService;
    private final UserExecutionStatsService statsService;

    public ReviewService(
            ReviewRepository reviewRepository,
            CommitmentRepository commitmentRepository,
            CommitmentService commitmentService,
            UserExecutionStatsService statsService
    ) {
        this.reviewRepository = reviewRepository;
        this.commitmentRepository = commitmentRepository;
        this.commitmentService = commitmentService;
        this.statsService = statsService;
    }

    @Transactional
    @CacheEvict(value = "ai_insights", key = "#userId")
    public ReviewResponse reviewCommitment(UUID userId, UUID commitmentId, ReviewCommitmentRequest request) {
        Commitment commitment = commitmentService.findActiveCommitment(commitmentId, userId);

        // Update commitment status
        commitment.setStatus(request.getStatus());
        if (request.getStatus() == CommitmentStatus.COMPLETED) {
            commitment.setCompletedAt(OffsetDateTime.now());
        }

        // Find or create review
        CommitmentReview review = reviewRepository.findByCommitmentId(commitmentId)
                .orElse(new CommitmentReview());

        review.setCommitment(commitment);
        review.setStatus(request.getStatus());
        review.setFailureReason(request.getFailureReason());
        review.setReflection(request.getReflection());
        review.setNextAction(request.getNextAction());
        review.setReviewedAt(OffsetDateTime.now());

        commitmentRepository.save(commitment);
        CommitmentReview savedReview = reviewRepository.save(review);
        statsService.refreshStatsAsync(userId);

        // Handle next action (e.g. Move to tomorrow / reschedule) with strict idempotency
        if (request.getNextAction() != null) {
            LocalDate targetDate = null;
            if (request.getNextAction() == NextAction.MOVE_TO_TOMORROW) {
                targetDate = commitment.getCommitmentDate().plusDays(1);
            } else if (request.getNextAction() == NextAction.RESCHEDULE && request.getRescheduleDate() != null) {
                targetDate = request.getRescheduleDate();
            }

            if (targetDate != null) {
                // Idempotent: Update existing downstream copy if already postponed earlier, or create new
                var existingCopyOpt = commitmentRepository.findNextPendingPostponedCopy(commitment.getId());
                if (existingCopyOpt.isPresent()) {
                    Commitment existingCopy = existingCopyOpt.get();
                    existingCopy.setCommitmentDate(targetDate);
                    commitmentRepository.save(existingCopy);
                } else {
                    Commitment nextCommitment = new Commitment();
                    nextCommitment.setUser(commitment.getUser());
                    nextCommitment.setTitle(commitment.getTitle());
                    nextCommitment.setDescription(commitment.getDescription());
                    nextCommitment.setExpectedOutcome(commitment.getExpectedOutcome());
                    nextCommitment.setEstimatedMinutes(commitment.getEstimatedMinutes());
                    nextCommitment.setPriority(commitment.getPriority());
                    nextCommitment.setCommitmentDate(targetDate);
                    nextCommitment.setVisibility(commitment.getVisibility());
                    nextCommitment.setStatus(CommitmentStatus.PENDING);
                    nextCommitment.setPostponedFromId(commitment.getId());

                    UUID rootOriginId = commitment.getOriginCommitmentId() != null ? commitment.getOriginCommitmentId() : commitment.getId();
                    nextCommitment.setOriginCommitmentId(rootOriginId);
                    nextCommitment.setPostponementCount(commitment.getPostponementCount() + 1);

                    commitmentRepository.save(nextCommitment);
                }
            } else if (request.getNextAction() == NextAction.DROP || request.getStatus() == CommitmentStatus.COMPLETED) {
                // Clean up any lingering downstream copy if dropped or completed
                commitmentRepository.findNextPendingPostponedCopy(commitment.getId()).ifPresent(existing -> {
                    existing.setDeletedAt(OffsetDateTime.now());
                    commitmentRepository.save(existing);
                });
            }
        }

        return ReviewResponse.fromEntity(savedReview);
    }

    public ReviewResponse getReviewByCommitmentId(UUID userId, UUID commitmentId) {
        commitmentService.findActiveCommitment(commitmentId, userId);
        CommitmentReview review = reviewRepository.findByCommitmentId(commitmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No review found for commitment: " + commitmentId));
        return ReviewResponse.fromEntity(review);
    }
}
