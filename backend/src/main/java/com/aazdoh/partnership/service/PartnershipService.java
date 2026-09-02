package com.aazdoh.partnership.service;

import com.aazdoh.commitment.dto.CommitmentResponse;
import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.entity.CommitmentVisibility;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.common.exception.BadRequestException;
import com.aazdoh.common.exception.ForbiddenException;
import com.aazdoh.common.exception.ResourceNotFoundException;
import com.aazdoh.partnership.dto.InvitePartnerRequest;
import com.aazdoh.partnership.dto.PartnerDailyOverviewDto;
import com.aazdoh.partnership.dto.PartnershipResponse;
import com.aazdoh.partnership.entity.AccountabilityPartnership;
import com.aazdoh.partnership.entity.PartnershipStatus;
import com.aazdoh.partnership.repository.PartnershipRepository;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.repository.UserRepository;
import com.aazdoh.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PartnershipService {

    private final PartnershipRepository partnershipRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final CommitmentRepository commitmentRepository;
    private final com.aazdoh.ai.context.AccountabilityContextBuilder contextBuilder;
    private final com.aazdoh.ai.client.AccountabilityAiClient aiClient;
    private final com.aazdoh.discussion.repository.DiscussionMessageRepository discussionMessageRepository;
    private final com.aazdoh.ai.repository.AiStressTestSnapshotRepository aiSnapshotRepository;

    public PartnershipService(
            PartnershipRepository partnershipRepository,
            UserRepository userRepository,
            UserService userService,
            CommitmentRepository commitmentRepository,
            com.aazdoh.ai.context.AccountabilityContextBuilder contextBuilder,
            com.aazdoh.ai.client.AccountabilityAiClient aiClient,
            com.aazdoh.discussion.repository.DiscussionMessageRepository discussionMessageRepository,
            com.aazdoh.ai.repository.AiStressTestSnapshotRepository aiSnapshotRepository
    ) {
        this.partnershipRepository = partnershipRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.commitmentRepository = commitmentRepository;
        this.contextBuilder = contextBuilder;
        this.aiClient = aiClient;
        this.discussionMessageRepository = discussionMessageRepository;
        this.aiSnapshotRepository = aiSnapshotRepository;
    }

    @Transactional
    public PartnershipResponse invitePartner(UUID requesterId, InvitePartnerRequest request) {
        User requester = userService.findUserById(requesterId);

        if (requester.getEmail().equalsIgnoreCase(request.getPartnerEmail().trim())) {
            throw new BadRequestException("You cannot invite yourself as an accountability partner");
        }

        User partner = userRepository.findByEmail(request.getPartnerEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("No user found with email: " + request.getPartnerEmail()));

        Optional<AccountabilityPartnership> existing = partnershipRepository.findActiveBetween(requesterId, partner.getId());
        if (existing.isPresent()) {
            throw new BadRequestException("An active partnership or pending invitation already exists with this user");
        }

        com.aazdoh.partnership.entity.PartnershipType type = request.getPartnershipType() != null 
                ? request.getPartnershipType() 
                : com.aazdoh.partnership.entity.PartnershipType.MUTUAL;
        boolean sharePartnerCommitments = (type == com.aazdoh.partnership.entity.PartnershipType.MUTUAL);

        AccountabilityPartnership partnership = new AccountabilityPartnership(
                requester, 
                partner, 
                type, 
                sharePartnerCommitments
        );
        AccountabilityPartnership saved = partnershipRepository.save(partnership);

        return PartnershipResponse.fromEntity(saved);
    }

    @Transactional
    public PartnershipResponse acceptInvitation(UUID userId, UUID partnershipId, com.aazdoh.partnership.dto.AcceptPartnershipRequest acceptRequest) {
        AccountabilityPartnership partnership = findPartnership(partnershipId);

        if (!partnership.getPartner().getId().equals(userId)) {
            throw new ForbiddenException("Only the invited partner can accept this invitation");
        }

        partnership.setStatus(PartnershipStatus.ACCEPTED);
        if (acceptRequest != null && acceptRequest.getShareMyCommitments() != null) {
            partnership.setSharePartnerCommitments(acceptRequest.getShareMyCommitments());
        }
        AccountabilityPartnership saved = partnershipRepository.save(partnership);
        return PartnershipResponse.fromEntity(saved);
    }

    @Transactional
    public PartnershipResponse rejectInvitation(UUID userId, UUID partnershipId) {
        AccountabilityPartnership partnership = findPartnership(partnershipId);

        if (!partnership.getPartner().getId().equals(userId)) {
            throw new ForbiddenException("Only the invited partner can reject this invitation");
        }

        partnership.setStatus(PartnershipStatus.REJECTED);
        AccountabilityPartnership saved = partnershipRepository.save(partnership);
        return PartnershipResponse.fromEntity(saved);
    }

    @Transactional
    public void terminatePartnership(UUID userId, UUID partnershipId) {
        AccountabilityPartnership partnership = findPartnership(partnershipId);

        if (!partnership.getRequester().getId().equals(userId) && !partnership.getPartner().getId().equals(userId)) {
            throw new ForbiddenException("You are not a participant in this partnership");
        }

        partnership.setStatus(PartnershipStatus.TERMINATED);
        partnershipRepository.save(partnership);
    }

    public List<PartnershipResponse> getActivePartnerships(UUID userId) {
        return partnershipRepository.findAllByUserIdAndStatus(userId, PartnershipStatus.ACCEPTED)
                .stream()
                .map(PartnershipResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PartnershipResponse> getPendingIncomingInvitations(UUID userId) {
        return partnershipRepository.findPendingIncomingRequests(userId)
                .stream()
                .map(PartnershipResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PartnershipResponse> getPendingOutgoingInvitations(UUID userId) {
        return partnershipRepository.findPendingOutgoingRequests(userId)
                .stream()
                .map(PartnershipResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public PartnerDailyOverviewDto getPartnerDailyOverview(UUID currentUserId, UUID partnerUserId, LocalDate date) {
        // Verify active partnership
        AccountabilityPartnership partnership = partnershipRepository.findActiveBetween(currentUserId, partnerUserId)
                .orElseThrow(() -> new ForbiddenException("You do not have an active partnership with this user"));

        if (partnership.getStatus() != PartnershipStatus.ACCEPTED) {
            throw new ForbiddenException("Partnership is not accepted");
        }

        User partner = userService.findUserById(partnerUserId);
        
        // Timezone-aware resolution: if date not provided, evaluate today in partner's local timezone
        LocalDate targetDate = date;
        if (targetDate == null) {
            try {
                java.time.ZoneId partnerZone = (partner.getTimezone() != null && !partner.getTimezone().isBlank())
                        ? java.time.ZoneId.of(partner.getTimezone())
                        : java.time.ZoneId.systemDefault();
                targetDate = LocalDate.now(partnerZone);
            } catch (Exception e) {
                targetDate = LocalDate.now();
            }
        }

        // Privacy enforcement: If partner is an asymmetric sponsor/observer, their personal commitments are hidden from requester
        boolean isPartnerPrivateSponsor = currentUserId.equals(partnership.getRequester().getId()) 
                && !partnership.isSharePartnerCommitments();

        if (isPartnerPrivateSponsor) {
            PartnerDailyOverviewDto overview = new PartnerDailyOverviewDto(partner.getId(), partner.getFullName(), targetDate, java.util.Collections.emptyList());
            overview.setOneWaySponsor(true);
            overview.setAiDiagnosticSummary(partner.getFullName() + " is serving as your 1-Way Accountability Sponsor. Their personal commitments remain private.");
            return overview;
        }

        List<Commitment> sharedCommitments = commitmentRepository.findSharedCommitmentsForPartner(
                partnerUserId,
                currentUserId,
                targetDate
        );

        List<CommitmentResponse> dtoList = sharedCommitments.stream()
                .map(CommitmentResponse::fromEntity)
                .collect(Collectors.toList());

        populateDiscussionStats(dtoList, currentUserId);

        PartnerDailyOverviewDto overview = new PartnerDailyOverviewDto(partner.getId(), partner.getFullName(), targetDate, dtoList);

        if (dtoList.isEmpty()) {
            overview.setAiRiskScore(0);
            overview.setAiRiskLevel("LOW");
            overview.setAiDiagnosticSummary(partner.getFullName() + " has no shared commitments scheduled for today.");
            overview.setPlannedHours(0.0);
            overview.setCapacityHours(2.0);
            return overview;
        }

        // Fast Snapshot Cache lookup (0ms latency, zero LLM calls)
        String planHash = com.aazdoh.ai.service.AiAccountabilityService.computePlanHash(dtoList);
        java.util.Optional<com.aazdoh.ai.entity.AiStressTestSnapshot> cachedSnapshot =
                aiSnapshotRepository.findFirstByUserIdAndCommitmentDateAndPlanHash(partnerUserId, targetDate, planHash);

        if (cachedSnapshot.isPresent()) {
            com.aazdoh.ai.entity.AiStressTestSnapshot snapshot = cachedSnapshot.get();
            overview.setAiRiskScore(snapshot.getRiskScore());
            overview.setAiRiskLevel(snapshot.getRiskLevel());
            overview.setAiDiagnosticSummary(snapshot.getDiagnosticSummary());
            overview.setPlannedHours(snapshot.getPlannedHours());
            overview.setCapacityHours(snapshot.getCapacityHours());
            return overview;
        }

        // Compute live AI Brief only on cache miss
        try {
            com.aazdoh.ai.context.UserAccountabilityContextDto context = contextBuilder.buildContext(partnerUserId);
            com.aazdoh.ai.dto.PlanStressTestResponse stressTest = aiClient.stressTestPlan(
                    context,
                    dtoList,
                    null,
                    false,
                    partner.getAiPersona()
            );

            if (stressTest != null) {
                overview.setAiRiskScore(stressTest.getRiskScore());
                overview.setAiRiskLevel(stressTest.getRiskLevel() != null ? stressTest.getRiskLevel() : "LOW");
                overview.setAiDiagnosticSummary(stressTest.getDiagnosticSummary());
                overview.setPlannedHours(stressTest.getPlannedHours());
                overview.setCapacityHours(stressTest.getHistoricalCapacityHours());

                // Persist snapshot so subsequent views are instant (<2ms)
                try {
                    com.aazdoh.ai.entity.AiStressTestSnapshot snapshot = new com.aazdoh.ai.entity.AiStressTestSnapshot();
                    snapshot.setUser(partner);
                    snapshot.setCommitmentDate(targetDate);
                    snapshot.setPlanHash(planHash);
                    snapshot.setRiskScore(stressTest.getRiskScore());
                    snapshot.setRiskLevel(stressTest.getRiskLevel() != null ? stressTest.getRiskLevel() : "LOW");
                    snapshot.setDiagnosticSummary(stressTest.getDiagnosticSummary());
                    snapshot.setPlannedHours(stressTest.getPlannedHours());
                    snapshot.setCapacityHours(stressTest.getHistoricalCapacityHours());
                    snapshot.setOptimizedHours(stressTest.getOptimizedHours());
                    aiSnapshotRepository.save(snapshot);
                } catch (Exception ignored) {}
            }
        } catch (Exception e) {
            overview.setAiRiskScore(15);
            overview.setAiRiskLevel("LOW");
            overview.setAiDiagnosticSummary(partner.getFullName() + " has " + dtoList.size() + " shared commitments scheduled for today.");
        }

        return overview;
    }

    public boolean areActivePartners(UUID user1, UUID user2) {
        if (user1.equals(user2)) return true;
        return partnershipRepository.findActiveBetween(user1, user2)
                .map(p -> p.getStatus() == PartnershipStatus.ACCEPTED)
                .orElse(false);
    }

    private AccountabilityPartnership findPartnership(UUID partnershipId) {
        return partnershipRepository.findById(partnershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Partnership not found with id: " + partnershipId));
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
