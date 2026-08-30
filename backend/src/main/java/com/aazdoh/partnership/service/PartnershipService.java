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

    public PartnershipService(
            PartnershipRepository partnershipRepository,
            UserRepository userRepository,
            UserService userService,
            CommitmentRepository commitmentRepository
    ) {
        this.partnershipRepository = partnershipRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.commitmentRepository = commitmentRepository;
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

        AccountabilityPartnership partnership = new AccountabilityPartnership(requester, partner);
        AccountabilityPartnership saved = partnershipRepository.save(partnership);

        return PartnershipResponse.fromEntity(saved);
    }

    @Transactional
    public PartnershipResponse acceptInvitation(UUID userId, UUID partnershipId) {
        AccountabilityPartnership partnership = findPartnership(partnershipId);

        if (!partnership.getPartner().getId().equals(userId)) {
            throw new ForbiddenException("Only the invited partner can accept this invitation");
        }

        partnership.setStatus(PartnershipStatus.ACCEPTED);
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

        List<Commitment> sharedCommitments = commitmentRepository.findByUserIdAndVisibilityAndCommitmentDate(
                partnerUserId,
                CommitmentVisibility.SHARED_WITH_PARTNER,
                targetDate
        );

        List<CommitmentResponse> dtoList = sharedCommitments.stream()
                .map(CommitmentResponse::fromEntity)
                .collect(Collectors.toList());

        return new PartnerDailyOverviewDto(partner.getId(), partner.getFullName(), date, dtoList);
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
}
