package com.aazdoh.ai.service;

import com.aazdoh.ai.client.AccountabilityAiClient;
import com.aazdoh.ai.context.AccountabilityContextBuilder;
import com.aazdoh.ai.context.UserAccountabilityContextDto;
import com.aazdoh.ai.dto.AiFeedbackResponse;
import com.aazdoh.ai.dto.ApplyOptimizedPlanRequest;
import com.aazdoh.ai.dto.BehavioralSynthesisDto;
import com.aazdoh.ai.dto.ExcuseAnalysisRequest;
import com.aazdoh.ai.dto.ExcuseAnalysisResponse;
import com.aazdoh.ai.dto.HistoricalExcuseReceipt;
import com.aazdoh.ai.dto.OptimizedTaskProposal;
import com.aazdoh.ai.dto.PlanStressTestRequest;
import com.aazdoh.ai.dto.PlanStressTestResponse;
import com.aazdoh.ai.dto.SplitBlockDetail;
import com.aazdoh.ai.entity.AiInteraction;
import com.aazdoh.ai.entity.AiStressTestSnapshot;
import com.aazdoh.ai.repository.AiInteractionRepository;
import com.aazdoh.ai.repository.AiStressTestSnapshotRepository;
import com.aazdoh.analytics.entity.UserExecutionStats;
import com.aazdoh.analytics.service.UserExecutionStatsService;
import com.aazdoh.commitment.dto.CommitmentResponse;
import com.aazdoh.commitment.dto.CreateCommitmentRequest;
import com.aazdoh.commitment.dto.PostponeCommitmentRequest;
import com.aazdoh.commitment.dto.UpdateCommitmentRequest;
import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.entity.CommitmentPriority;
import com.aazdoh.commitment.entity.CommitmentVisibility;
import com.aazdoh.commitment.service.CommitmentService;
import com.aazdoh.review.dto.ReviewResponse;
import com.aazdoh.review.service.ReviewService;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class AiAccountabilityService {

    private static final Logger log = LoggerFactory.getLogger(AiAccountabilityService.class);

    private final AccountabilityContextBuilder contextBuilder;
    private final AccountabilityAiClient aiClient;
    private final CommitmentService commitmentService;
    private final ReviewService reviewService;
    private final UserService userService;
    private final UserExecutionStatsService statsService;
    private final AiInteractionRepository aiInteractionRepository;
    private final AiStressTestSnapshotRepository snapshotRepository;
    private final ObjectMapper objectMapper;

    public AiAccountabilityService(
            AccountabilityContextBuilder contextBuilder,
            AccountabilityAiClient aiClient,
            CommitmentService commitmentService,
            ReviewService reviewService,
            UserService userService,
            UserExecutionStatsService statsService,
            AiInteractionRepository aiInteractionRepository,
            AiStressTestSnapshotRepository snapshotRepository,
            ObjectMapper objectMapper
    ) {
        this.contextBuilder = contextBuilder;
        this.aiClient = aiClient;
        this.commitmentService = commitmentService;
        this.reviewService = reviewService;
        this.userService = userService;
        this.statsService = statsService;
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
    public CompletableFuture<BehavioralSynthesisDto> getBehavioralSynthesisAsync(UUID userId) {
        // Fast-path: O(1) single-row read from user_execution_stats
        UserExecutionStats stats = statsService.getOrComputeStats(userId);
        if (stats.getBehavioralSynthesisJson() != null && !stats.getBehavioralSynthesisJson().isBlank()) {
            try {
                BehavioralSynthesisDto cached = objectMapper.readValue(stats.getBehavioralSynthesisJson(), BehavioralSynthesisDto.class);
                return CompletableFuture.completedFuture(cached);
            } catch (Exception e) {
                log.warn("Failed to deserialize cached behavioral synthesis JSON for user {}", userId, e);
            }
        }

        // Slow-path (first run or cache miss): compute and persist
        User user = userService.findUserById(userId);
        UserAccountabilityContextDto context = contextBuilder.buildContext(userId);
        BehavioralSynthesisDto synthesis = aiClient.generateBehavioralSynthesis(context, null, user.getAiPersona());

        try {
            String json = objectMapper.writeValueAsString(synthesis);
            statsService.updateBehavioralSynthesis(userId, json);
            aiInteractionRepository.save(new AiInteraction(user, "BEHAVIORAL_SYNTHESIS", "Behavioral Synthesis Generation", synthesis.summary()));
        } catch (Exception e) {
            log.warn("Failed to save newly computed behavioral synthesis for user {}", userId, e);
        }

        return CompletableFuture.completedFuture(synthesis);
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<AiFeedbackResponse> getBehavioralInsightsAsync(UUID userId) {
        return getBehavioralSynthesisAsync(userId).thenApply(synthesis ->
                new AiFeedbackResponse(synthesis.summary(), synthesis.persona())
        );
    }

    @Async
    @Transactional
    public void evolveBehavioralMemoryAsync(UUID userId) {
        try {
            User user = userService.findUserById(userId);
            UserExecutionStats stats = statsService.getOrComputeStats(userId);
            String priorSynthesis = stats.getBehavioralSynthesisJson();

            UserAccountabilityContextDto context = contextBuilder.buildContext(userId);
            BehavioralSynthesisDto newSynthesis = aiClient.generateBehavioralSynthesis(context, priorSynthesis, user.getAiPersona());

            String json = objectMapper.writeValueAsString(newSynthesis);
            statsService.updateBehavioralSynthesis(userId, json);
            aiInteractionRepository.save(new AiInteraction(user, "BEHAVIORAL_MEMORY_EVOLUTION", "Delta Synthesis Evolution", newSynthesis.summary()));
        } catch (Exception e) {
            log.warn("Failed to evolve behavioral memory asynchronously for user {}", userId, e);
        }
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<PlanStressTestResponse> stressTestPlanAsync(UUID userId, PlanStressTestRequest request) {
        User user = userService.findUserById(userId);
        LocalDate targetDate = request != null && request.getDate() != null ? request.getDate() : LocalDate.now();
        List<CommitmentResponse> todaysCommitments = commitmentService.getTodayCommitments(userId, targetDate);

        if (todaysCommitments.isEmpty()) {
            PlanStressTestResponse emptyRes = new PlanStressTestResponse();
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
            Optional<AiStressTestSnapshot> cached =
                    snapshotRepository.findFirstByUserIdAndCommitmentDateAndPlanHash(userId, targetDate, planHash);
            if (cached.isPresent()) {
                return CompletableFuture.completedFuture(mapSnapshotToResponse(cached.get(), user.getAiPersona().name()));
            }
        }

        UserAccountabilityContextDto context = contextBuilder.buildContext(userId);

        PlanStressTestResponse response = aiClient.stressTestPlan(
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
    public List<CommitmentResponse> applyOptimizedPlan(UUID userId, ApplyOptimizedPlanRequest request) {
        if (request == null || request.getAcceptedProposals() == null || request.getAcceptedProposals().isEmpty()) {
            return commitmentService.getTodayCommitments(userId, LocalDate.now());
        }

        for (OptimizedTaskProposal proposal : request.getAcceptedProposals()) {
            if (proposal.getOriginalCommitmentId() == null) continue;

            if ("SHIFT_TO_TOMORROW".equalsIgnoreCase(proposal.getSuggestedAction())) {
                CommitmentResponse orig = commitmentService.getCommitmentById(userId, proposal.getOriginalCommitmentId());
                LocalDate baseDate = orig.getCommitmentDate() != null ? orig.getCommitmentDate() : LocalDate.now();
                PostponeCommitmentRequest postponeReq = new PostponeCommitmentRequest();
                postponeReq.setNewDate(baseDate.plusDays(1));
                commitmentService.postponeCommitment(userId, proposal.getOriginalCommitmentId(), postponeReq);
            } else if ("SPLIT".equalsIgnoreCase(proposal.getSuggestedAction())) {
                CommitmentResponse orig = commitmentService.getCommitmentById(userId, proposal.getOriginalCommitmentId());
                List<SplitBlockDetail> blocks = proposal.getSplitBlocks();
                LocalDate baseDate = orig.getCommitmentDate() != null ? orig.getCommitmentDate() : LocalDate.now();

                // If blocks is null or empty, dynamically compute split blocks so tasks are NEVER dropped or trimmed
                if (blocks == null || blocks.isEmpty()) {
                    blocks = new ArrayList<>();
                    int totalMinutes = orig.getEstimatedMinutes() > 0 ? orig.getEstimatedMinutes() : (proposal.getCurrentMinutes() > 0 ? proposal.getCurrentMinutes() : 60);
                    int chunkSize = proposal.getProposedMinutes() > 0 ? proposal.getProposedMinutes() : 45;
                    int remaining = totalMinutes;
                    int partNum = 1;
                    while (remaining > 0) {
                        int size = Math.min(remaining, chunkSize);
                        blocks.add(new SplitBlockDetail(
                                partNum,
                                "Part " + partNum + ": " + orig.getTitle(),
                                size,
                                false
                        ));
                        remaining -= size;
                        partNum++;
                    }
                }

                if (!blocks.isEmpty()) {
                    // 1. Update original commitment to Part 1
                    SplitBlockDetail firstBlock = blocks.get(0);
                    UpdateCommitmentRequest updateReq = new UpdateCommitmentRequest();
                    updateReq.setTitle(firstBlock.getTitle());
                    updateReq.setEstimatedMinutes(firstBlock.getMinutes());
                    commitmentService.updateCommitment(userId, proposal.getOriginalCommitmentId(), updateReq);

                    // 2. Automatically generate subsequent sibling blocks (Part 2, Part 3, etc.)
                    for (int bIdx = 1; bIdx < blocks.size(); bIdx++) {
                        SplitBlockDetail block = blocks.get(bIdx);
                        LocalDate targetDate = block.isScheduleTomorrow() ? baseDate.plusDays(1) : baseDate;

                        CreateCommitmentRequest createReq = new CreateCommitmentRequest();
                        createReq.setTitle(block.getTitle());
                        createReq.setDescription(orig.getDescription());
                        createReq.setEstimatedMinutes(block.getMinutes());
                        createReq.setPriority(orig.getPriority() != null ? orig.getPriority() : CommitmentPriority.MEDIUM);
                        createReq.setVisibility(orig.getVisibility() != null ? orig.getVisibility() : CommitmentVisibility.SHARED_WITH_PARTNER);
                        createReq.setTargetPartnerId(orig.getTargetPartnerId());
                        createReq.setCommitmentDate(targetDate);
                        createReq.setExpectedOutcome(orig.getExpectedOutcome());
                        commitmentService.createCommitment(userId, createReq);
                    }
                }
            } else if ("TRIM".equalsIgnoreCase(proposal.getSuggestedAction())) {
                UpdateCommitmentRequest updateReq = new UpdateCommitmentRequest();
                updateReq.setTitle(proposal.getProposedTitle());
                updateReq.setEstimatedMinutes(proposal.getProposedMinutes());
                commitmentService.updateCommitment(userId, proposal.getOriginalCommitmentId(), updateReq);
            }
        }

        return commitmentService.getTodayCommitments(userId, LocalDate.now());
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<ExcuseAnalysisResponse> detectExcusePatternAsync(UUID userId, ExcuseAnalysisRequest request) {
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
        List<HistoricalExcuseReceipt> receipts = new ArrayList<>();
        List<Commitment> pastPostponed = commitmentService.getRecentPostponedCommitments(userId);
        if (pastPostponed != null) {
            for (Commitment p : pastPostponed) {
                if (p.getPostponeReason() != null && !p.getPostponeReason().isBlank()) {
                    receipts.add(new HistoricalExcuseReceipt(
                            p.getCommitmentDate(),
                            p.getTitle(),
                            p.getPostponeReason(),
                            p.getStatus().name()
                    ));
                }
            }
        }

        ExcuseAnalysisResponse response = aiClient.detectExcusePattern(
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
                .sorted(Comparator.comparing(CommitmentResponse::getId))
                .forEach(c -> sb.append(c.getId())
                               .append(":")
                               .append(c.getEstimatedMinutes())
                               .append(":")
                               .append(c.getTitle())
                               .append(";"));
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(sb.toString().getBytes(StandardCharsets.UTF_8));
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

    private void saveSnapshot(User user, LocalDate date, String planHash, PlanStressTestResponse response) {
        try {
            AiStressTestSnapshot snapshot = snapshotRepository
                    .findFirstByUserIdAndCommitmentDateAndPlanHash(user.getId(), date, planHash)
                    .orElseGet(AiStressTestSnapshot::new);

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

    private PlanStressTestResponse mapSnapshotToResponse(AiStressTestSnapshot snapshot, String persona) {
        PlanStressTestResponse res = new PlanStressTestResponse();
        res.setRiskScore(snapshot.getRiskScore());
        res.setRiskLevel(snapshot.getRiskLevel());
        res.setDiagnosticSummary(snapshot.getDiagnosticSummary());
        res.setPlannedHours(snapshot.getPlannedHours());
        res.setHistoricalCapacityHours(snapshot.getCapacityHours());
        res.setOptimizedHours(snapshot.getOptimizedHours());
        res.setPersona(persona);
        if (snapshot.getProposalsJson() != null && !snapshot.getProposalsJson().isBlank()) {
            try {
                List<OptimizedTaskProposal> proposals = objectMapper.readValue(
                        snapshot.getProposalsJson(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, OptimizedTaskProposal.class)
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
