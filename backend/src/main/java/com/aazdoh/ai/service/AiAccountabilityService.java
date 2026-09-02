package com.aazdoh.ai.service;

import com.aazdoh.ai.client.AccountabilityAiClient;
import com.aazdoh.ai.context.AccountabilityContextBuilder;
import com.aazdoh.ai.context.UserAccountabilityContextDto;
import com.aazdoh.ai.dto.AiFeedbackResponse;
import com.aazdoh.ai.entity.AiInteraction;
import com.aazdoh.ai.repository.AiInteractionRepository;
import com.aazdoh.commitment.dto.CommitmentResponse;
import com.aazdoh.commitment.service.CommitmentService;
import com.aazdoh.review.dto.ReviewResponse;
import com.aazdoh.review.service.ReviewService;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.service.UserService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class AiAccountabilityService {

    private final AccountabilityContextBuilder contextBuilder;
    private final AccountabilityAiClient aiClient;
    private final CommitmentService commitmentService;
    private final ReviewService reviewService;
    private final UserService userService;
    private final AiInteractionRepository aiInteractionRepository;
    private final com.aazdoh.ai.repository.AiStressTestSnapshotRepository snapshotRepository;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public AiAccountabilityService(
            AccountabilityContextBuilder contextBuilder,
            AccountabilityAiClient aiClient,
            CommitmentService commitmentService,
            ReviewService reviewService,
            UserService userService,
            AiInteractionRepository aiInteractionRepository,
            com.aazdoh.ai.repository.AiStressTestSnapshotRepository snapshotRepository,
            com.fasterxml.jackson.databind.ObjectMapper objectMapper
    ) {
        this.contextBuilder = contextBuilder;
        this.aiClient = aiClient;
        this.commitmentService = commitmentService;
        this.reviewService = reviewService;
        this.userService = userService;
        this.aiInteractionRepository = aiInteractionRepository;
        this.snapshotRepository = snapshotRepository;
        this.objectMapper = objectMapper;
    }

    @Async
    @Transactional
    public CompletableFuture<AiFeedbackResponse> reviewDailyPlanAsync(UUID userId, LocalDate date) {
        User user = userService.findUserById(userId);
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<CommitmentResponse> todaysCommitments = commitmentService.getTodayCommitments(userId, targetDate);

        if (todaysCommitments.isEmpty()) {
            return CompletableFuture.completedFuture(
                    new AiFeedbackResponse("You have not created any commitments for " + targetDate + " yet. Add your top 2-3 priorities to get started.", user.getAiPersona().name())
            );
        }

        UserAccountabilityContextDto context = contextBuilder.buildContext(userId);
        String feedback = aiClient.reviewPlanFeasibility(context, todaysCommitments, user.getAiPersona());

        // Save interaction
        aiInteractionRepository.save(new AiInteraction(user, "DAILY_PLAN_REVIEW", "Review commitments for " + targetDate, feedback));

        return CompletableFuture.completedFuture(new AiFeedbackResponse(feedback, user.getAiPersona().name()));
    }

    @Async
    @Transactional
    public CompletableFuture<AiFeedbackResponse> reviewMissedCommitmentAsync(UUID userId, UUID commitmentId) {
        User user = userService.findUserById(userId);
        CommitmentResponse commitment = commitmentService.getCommitmentById(userId, commitmentId);
        ReviewResponse review = reviewService.getReviewByCommitmentId(userId, commitmentId);

        UserAccountabilityContextDto context = contextBuilder.buildContext(userId);
        String reasonStr = review.getFailureReason() != null ? review.getFailureReason().name() : "Unspecified";
        String feedback = aiClient.analyzeMissedCommitment(context, commitment, reasonStr, review.getReflection(), user.getAiPersona());

        aiInteractionRepository.save(new AiInteraction(user, "MISSED_COMMITMENT_ANALYSIS", "Analysis for " + commitment.getTitle(), feedback));

        return CompletableFuture.completedFuture(new AiFeedbackResponse(feedback, user.getAiPersona().name()));
    }

    @Async
    @Transactional(readOnly = true)
    @Cacheable(value = "ai_insights", key = "#userId")
    public CompletableFuture<AiFeedbackResponse> getBehavioralInsightsAsync(UUID userId) {
        User user = userService.findUserById(userId);
        UserAccountabilityContextDto context = contextBuilder.buildContext(userId);
        String feedback = aiClient.generateBehavioralInsights(context, user.getAiPersona());

        return CompletableFuture.completedFuture(new AiFeedbackResponse(feedback, user.getAiPersona().name()));
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<com.aazdoh.ai.dto.PlanStressTestResponse> stressTestPlanAsync(UUID userId, com.aazdoh.ai.dto.PlanStressTestRequest request) {
        User user = userService.findUserById(userId);
        LocalDate targetDate = request != null && request.getDate() != null ? request.getDate() : LocalDate.now();
        List<CommitmentResponse> todaysCommitments = commitmentService.getTodayCommitments(userId, targetDate);

        if (todaysCommitments.isEmpty()) {
            com.aazdoh.ai.dto.PlanStressTestResponse emptyRes = new com.aazdoh.ai.dto.PlanStressTestResponse();
            emptyRes.setRiskScore(0);
            emptyRes.setRiskLevel("LOW");
            emptyRes.setDiagnosticSummary("No commitments planned for today. Add 2-3 focused priorities to run a stress-test.");
            emptyRes.setProposedOptimizations(List.of());
            emptyRes.setPersona(user.getAiPersona().name());
            return CompletableFuture.completedFuture(emptyRes);
        }

        String quickDefense = request != null ? request.getQuickDefense() : null;
        boolean overrideSprint = request != null && request.isOverrideSprint();
        String planHash = computePlanHash(todaysCommitments);

        // Check snapshot cache if no defense override is active
        if ((quickDefense == null || quickDefense.isBlank()) && !overrideSprint) {
            java.util.Optional<com.aazdoh.ai.entity.AiStressTestSnapshot> cached =
                    snapshotRepository.findFirstByUserIdAndCommitmentDateAndPlanHash(userId, targetDate, planHash);
            if (cached.isPresent()) {
                return CompletableFuture.completedFuture(mapSnapshotToResponse(cached.get(), user.getAiPersona().name()));
            }
        }

        UserAccountabilityContextDto context = contextBuilder.buildContext(userId);

        com.aazdoh.ai.dto.PlanStressTestResponse response = aiClient.stressTestPlan(
                context,
                todaysCommitments,
                quickDefense,
                overrideSprint,
                user.getAiPersona()
        );

        // Save snapshot if not an override sprint
        if (!overrideSprint && (quickDefense == null || quickDefense.isBlank())) {
            saveSnapshot(user, targetDate, planHash, response);
        }

        return CompletableFuture.completedFuture(response);
    }

    @Transactional
    public List<CommitmentResponse> applyOptimizedPlan(UUID userId, com.aazdoh.ai.dto.ApplyOptimizedPlanRequest request) {
        if (request == null || request.getAcceptedProposals() == null || request.getAcceptedProposals().isEmpty()) {
            return commitmentService.getTodayCommitments(userId, LocalDate.now());
        }

        for (com.aazdoh.ai.dto.OptimizedTaskProposal proposal : request.getAcceptedProposals()) {
            if (proposal.getOriginalCommitmentId() == null) continue;

            if ("SHIFT_TO_TOMORROW".equalsIgnoreCase(proposal.getSuggestedAction())) {
                com.aazdoh.commitment.dto.PostponeCommitmentRequest postponeReq = new com.aazdoh.commitment.dto.PostponeCommitmentRequest();
                postponeReq.setNewDate(LocalDate.now().plusDays(1));
                commitmentService.postponeCommitment(userId, proposal.getOriginalCommitmentId(), postponeReq);
            } else if ("SPLIT".equalsIgnoreCase(proposal.getSuggestedAction())) {
                CommitmentResponse orig = commitmentService.getCommitmentById(userId, proposal.getOriginalCommitmentId());
                List<com.aazdoh.ai.dto.SplitBlockDetail> blocks = proposal.getSplitBlocks();

                if (blocks != null && !blocks.isEmpty()) {
                    // 1. Update original commitment to Part 1
                    com.aazdoh.ai.dto.SplitBlockDetail firstBlock = blocks.get(0);
                    com.aazdoh.commitment.dto.UpdateCommitmentRequest updateReq = new com.aazdoh.commitment.dto.UpdateCommitmentRequest();
                    updateReq.setTitle(firstBlock.getTitle());
                    updateReq.setEstimatedMinutes(firstBlock.getMinutes());
                    commitmentService.updateCommitment(userId, proposal.getOriginalCommitmentId(), updateReq);

                    // 2. Automatically generate subsequent sibling blocks (Part 2, Part 3, etc.)
                    for (int bIdx = 1; bIdx < blocks.size(); bIdx++) {
                        com.aazdoh.ai.dto.SplitBlockDetail block = blocks.get(bIdx);
                        LocalDate targetDate = block.isScheduleTomorrow() ? LocalDate.now().plusDays(1) : LocalDate.now();

                        com.aazdoh.commitment.dto.CreateCommitmentRequest createReq = new com.aazdoh.commitment.dto.CreateCommitmentRequest();
                        createReq.setTitle(block.getTitle());
                        createReq.setEstimatedMinutes(block.getMinutes());
                        createReq.setPriority(orig.getPriority() != null ? orig.getPriority() : com.aazdoh.commitment.entity.CommitmentPriority.MEDIUM);
                        createReq.setVisibility(orig.getVisibility() != null ? orig.getVisibility() : com.aazdoh.commitment.entity.CommitmentVisibility.SHARED_WITH_PARTNER);
                        createReq.setCommitmentDate(targetDate);
                        createReq.setExpectedOutcome(orig.getExpectedOutcome());
                        commitmentService.createCommitment(userId, createReq);
                    }
                } else {
                    com.aazdoh.commitment.dto.UpdateCommitmentRequest updateReq = new com.aazdoh.commitment.dto.UpdateCommitmentRequest();
                    updateReq.setTitle(proposal.getProposedTitle());
                    updateReq.setEstimatedMinutes(proposal.getProposedMinutes());
                    commitmentService.updateCommitment(userId, proposal.getOriginalCommitmentId(), updateReq);
                }
            } else if ("TRIM".equalsIgnoreCase(proposal.getSuggestedAction())) {
                com.aazdoh.commitment.dto.UpdateCommitmentRequest updateReq = new com.aazdoh.commitment.dto.UpdateCommitmentRequest();
                updateReq.setTitle(proposal.getProposedTitle());
                updateReq.setEstimatedMinutes(proposal.getProposedMinutes());
                commitmentService.updateCommitment(userId, proposal.getOriginalCommitmentId(), updateReq);
            }
        }

        return commitmentService.getTodayCommitments(userId, LocalDate.now());
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<com.aazdoh.ai.dto.ExcuseAnalysisResponse> detectExcusePatternAsync(UUID userId, com.aazdoh.ai.dto.ExcuseAnalysisRequest request) {
        User user = userService.findUserById(userId);
        UserAccountabilityContextDto context = contextBuilder.buildContext(userId);

        String taskTitle = "Task";
        if (request.getCommitmentId() != null) {
            try {
                CommitmentResponse c = commitmentService.getCommitmentById(userId, request.getCommitmentId());
                taskTitle = c.getTitle();
            } catch (Exception ignored) {}
        }

        // Gather historical receipts from past postponements and reviews
        List<com.aazdoh.ai.dto.HistoricalExcuseReceipt> receipts = new java.util.ArrayList<>();
        List<com.aazdoh.commitment.entity.Commitment> pastPostponed = commitmentService.getRecentPostponedCommitments(userId);
        if (pastPostponed != null) {
            for (com.aazdoh.commitment.entity.Commitment p : pastPostponed) {
                if (p.getPostponeReason() != null && !p.getPostponeReason().isBlank()) {
                    receipts.add(new com.aazdoh.ai.dto.HistoricalExcuseReceipt(
                            p.getCommitmentDate(),
                            p.getTitle(),
                            p.getPostponeReason(),
                            p.getStatus().name()
                    ));
                }
            }
        }

        com.aazdoh.ai.dto.ExcuseAnalysisResponse response = aiClient.detectExcusePattern(
                context,
                request.getExcuseText(),
                taskTitle,
                receipts,
                user.getAiPersona()
        );

        return CompletableFuture.completedFuture(response);
    }

    public static String computePlanHash(List<CommitmentResponse> commitments) {
        if (commitments == null || commitments.isEmpty()) {
            return "empty";
        }
        StringBuilder sb = new StringBuilder();
        commitments.stream()
                .sorted(java.util.Comparator.comparing(CommitmentResponse::getId))
                .forEach(c -> sb.append(c.getId())
                               .append(":")
                               .append(c.getEstimatedMinutes())
                               .append(":")
                               .append(c.getTitle())
                               .append(";"));
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return Integer.toHexString(sb.toString().hashCode());
        }
    }

    private void saveSnapshot(User user, LocalDate date, String planHash, com.aazdoh.ai.dto.PlanStressTestResponse response) {
        try {
            com.aazdoh.ai.entity.AiStressTestSnapshot snapshot = snapshotRepository
                    .findFirstByUserIdAndCommitmentDateAndPlanHash(user.getId(), date, planHash)
                    .orElseGet(com.aazdoh.ai.entity.AiStressTestSnapshot::new);

            snapshot.setUser(user);
            snapshot.setCommitmentDate(date);
            snapshot.setPlanHash(planHash);
            snapshot.setRiskScore(response.getRiskScore());
            snapshot.setRiskLevel(response.getRiskLevel() != null ? response.getRiskLevel() : "LOW");
            snapshot.setDiagnosticSummary(response.getDiagnosticSummary());
            snapshot.setPlannedHours(response.getPlannedHours());
            snapshot.setCapacityHours(response.getHistoricalCapacityHours());
            snapshot.setOptimizedHours(response.getOptimizedHours());
            if (response.getProposedOptimizations() != null) {
                snapshot.setProposalsJson(objectMapper.writeValueAsString(response.getProposedOptimizations()));
            }
            snapshotRepository.save(snapshot);
        } catch (Exception ignored) {
        }
    }

    private com.aazdoh.ai.dto.PlanStressTestResponse mapSnapshotToResponse(com.aazdoh.ai.entity.AiStressTestSnapshot snapshot, String persona) {
        com.aazdoh.ai.dto.PlanStressTestResponse res = new com.aazdoh.ai.dto.PlanStressTestResponse();
        res.setRiskScore(snapshot.getRiskScore());
        res.setRiskLevel(snapshot.getRiskLevel());
        res.setDiagnosticSummary(snapshot.getDiagnosticSummary());
        res.setPlannedHours(snapshot.getPlannedHours());
        res.setHistoricalCapacityHours(snapshot.getCapacityHours());
        res.setOptimizedHours(snapshot.getOptimizedHours());
        res.setPersona(persona);
        if (snapshot.getProposalsJson() != null && !snapshot.getProposalsJson().isBlank()) {
            try {
                List<com.aazdoh.ai.dto.OptimizedTaskProposal> proposals = objectMapper.readValue(
                        snapshot.getProposalsJson(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, com.aazdoh.ai.dto.OptimizedTaskProposal.class)
                );
                res.setProposedOptimizations(proposals);
            } catch (Exception e) {
                res.setProposedOptimizations(List.of());
            }
        } else {
            res.setProposedOptimizations(List.of());
        }
        return res;
    }
}
