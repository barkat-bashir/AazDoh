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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CommitmentService {

    private final CommitmentRepository commitmentRepository;
    private final UserService userService;

    public CommitmentService(CommitmentRepository commitmentRepository, UserService userService) {
        this.commitmentRepository = commitmentRepository;
        this.userService = userService;
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

        Commitment saved = commitmentRepository.save(commitment);
        return CommitmentResponse.fromEntity(saved);
    }

    public List<CommitmentResponse> getTodayCommitments(UUID userId, LocalDate date) {
        List<Commitment> list = commitmentRepository.findByUserIdAndCommitmentDate(userId, date);
        return list.stream().map(CommitmentResponse::fromEntity).collect(Collectors.toList());
    }

    public List<CommitmentResponse> getCommitmentsByRange(UUID userId, LocalDate startDate, LocalDate endDate) {
        List<Commitment> list = commitmentRepository.findByUserIdAndDateRange(userId, startDate, endDate);
        return list.stream().map(CommitmentResponse::fromEntity).collect(Collectors.toList());
    }

    public CommitmentResponse getCommitmentById(UUID userId, UUID commitmentId) {
        Commitment commitment = findActiveCommitment(commitmentId, userId);
        return CommitmentResponse.fromEntity(commitment);
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

        Commitment updated = commitmentRepository.save(commitment);
        return CommitmentResponse.fromEntity(updated);
    }

    @Transactional
    public CommitmentResponse completeCommitment(UUID userId, UUID commitmentId) {
        Commitment commitment = findActiveCommitment(commitmentId, userId);
        commitment.setStatus(CommitmentStatus.COMPLETED);
        commitment.setCompletedAt(OffsetDateTime.now());
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

        Commitment savedNew = commitmentRepository.save(next);
        return CommitmentResponse.fromEntity(savedNew);
    }

    @Transactional
    public void deleteCommitment(UUID userId, UUID commitmentId) {
        Commitment commitment = findActiveCommitment(commitmentId, userId);
        commitment.setDeletedAt(OffsetDateTime.now());
        commitmentRepository.save(commitment);
    }

    public Commitment findActiveCommitment(UUID commitmentId, UUID userId) {
        return commitmentRepository.findActiveByIdAndUserId(commitmentId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Commitment not found with id: " + commitmentId));
    }
}
