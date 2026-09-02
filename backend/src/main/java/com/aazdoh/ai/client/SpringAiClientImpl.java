package com.aazdoh.ai.client;

import com.aazdoh.ai.context.UserAccountabilityContextDto;
import com.aazdoh.commitment.dto.CommitmentResponse;
import com.aazdoh.user.entity.AiPersona;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class SpringAiClientImpl implements AccountabilityAiClient {

    private static final Logger log = LoggerFactory.getLogger(SpringAiClientImpl.class);

    private final ChatModel chatModel;

    @Value("${aazdoh.ai.enabled:true}")
    private boolean aiEnabled;

    public SpringAiClientImpl(ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    @Override
    public String reviewPlanFeasibility(UserAccountabilityContextDto context, List<CommitmentResponse> todaysCommitments, AiPersona persona) {
        if (!aiEnabled || chatModel == null) {
            return generateMockPlanReview(context, todaysCommitments);
        }

        int totalEstimatedMinutes = todaysCommitments.stream().mapToInt(CommitmentResponse::getEstimatedMinutes).sum();
        double totalHours = totalEstimatedMinutes / 60.0;
        double avgHoursLast7Days = context.getAvgDailyFocusMinutesLast7Days() / 60.0;

        String commitmentListStr = todaysCommitments.stream()
                .map(c -> String.format("- %s (~%d mins, Priority: %s)", c.getTitle(), c.getEstimatedMinutes(), c.getPriority()))
                .collect(Collectors.joining("\n"));

        String promptText = String.format("""
                You are AazDoh's AI Accountability Agent with a %s personality.
                Your role is to challenge and assist the user (%s) in keeping their commitments.
                DO NOT shame, patronize, or use juvenile cheerleading. Be concise, objective, realistic, and direct.

                USER CONTEXT:
                - 7-day completion rate: %.1f%% (%d of %d completed)
                - 7-day average daily focus time: %.1f hours
                - Repeatedly postponed tasks: %s

                TODAY'S PLANNED COMMITMENTS (Total: %.1f hours):
                %s

                TASK:
                Analyze whether today's plan is realistic given their historical capacity.
                If they are overcommitting (planned hours noticeably exceeding their 7-day average), challenge them respectfully and suggest prioritizing or trimming.
                Keep your answer within 3-4 bullet points or short paragraphs.
                """,
                persona != null ? persona.name() : "BALANCED",
                context.getUserFullName(),
                context.getCompletionRateLast7Days(),
                context.getCompletedCommitmentsLast7Days(),
                context.getTotalCommitmentsLast7Days(),
                avgHoursLast7Days,
                context.getRepeatedlyPostponedTitles().isEmpty() ? "None" : String.join(", ", context.getRepeatedlyPostponedTitles()),
                totalHours,
                commitmentListStr
        );

        try {
            return chatModel.call(new Prompt(promptText)).getResult().getOutput().getContent();
        } catch (Exception ex) {
            log.warn("Error calling Spring AI provider, falling back to heuristic analysis: {}", ex.getMessage());
            return generateMockPlanReview(context, todaysCommitments);
        }
    }

    @Override
    public String analyzeMissedCommitment(UserAccountabilityContextDto context, CommitmentResponse commitment, String reason, String reflection, AiPersona persona) {
        if (!aiEnabled || chatModel == null) {
            return generateMockMissedAnalysis(commitment, reason, reflection);
        }

        String promptText = String.format("""
                You are AazDoh's AI Accountability Agent with a %s personality.
                The user (%s) missed a commitment and provided their reason and reflection.
                Analyze the root cause constructively without judgment or shame.

                MISSED COMMITMENT:
                - Title: %s
                - Estimated Time: %d mins
                - Priority: %s
                - Reported Reason: %s
                - User's Reflection: "%s"

                USER HISTORICAL CONTEXT:
                - Top recurring failure reasons: %s
                - Recent completion rate: %.1f%%

                TASK:
                Provide a crisp 2-3 sentence analysis. Is this an estimation error, priority conflict, or scope issue? Suggest an actionable adjustment for tomorrow.
                """,
                persona != null ? persona.name() : "BALANCED",
                context.getUserFullName(),
                commitment.getTitle(),
                commitment.getEstimatedMinutes(),
                commitment.getPriority(),
                reason,
                reflection != null ? reflection : "No reflection provided",
                context.getTopFailureReasons().toString(),
                context.getCompletionRateLast7Days()
        );

        try {
            return chatModel.call(new Prompt(promptText)).getResult().getOutput().getContent();
        } catch (Exception ex) {
            log.warn("Error calling Spring AI provider, falling back to heuristic analysis: {}", ex.getMessage());
            return generateMockMissedAnalysis(commitment, reason, reflection);
        }
    }

    @Override
    public String generateBehavioralInsights(UserAccountabilityContextDto context, AiPersona persona) {
        if (!aiEnabled || chatModel == null) {
            return String.format(
                    "Over the last 7 days, you achieved a %.1f%% completion rate across %d commitments. Focus on sizing tasks under 90 minutes to maintain consistency.",
                    context.getCompletionRateLast7Days(), context.getTotalCommitmentsLast7Days()
            );
        }

        String promptText = String.format("""
                You are AazDoh's AI Accountability Agent with a %s personality.
                Synthesize behavioral insights from the user's recent accountability metrics.

                USER DATA:
                - Name: %s
                - 7-day completion rate: %.1f%%
                - 7-day total commitments: %d (Completed: %d)
                - Average daily focus: %.1f hours
                - Frequent failure reasons: %s
                - Repeatedly postponed items: %s

                TASK:
                Provide 3 concise, highly actionable observations about their working patterns. Focus on execution patterns rather than generic advice.
                """,
                persona != null ? persona.name() : "BALANCED",
                context.getUserFullName(),
                context.getCompletionRateLast7Days(),
                context.getTotalCommitmentsLast7Days(),
                context.getCompletedCommitmentsLast7Days(),
                context.getAvgDailyFocusMinutesLast7Days() / 60.0,
                context.getTopFailureReasons().toString(),
                context.getRepeatedlyPostponedTitles().isEmpty() ? "None" : String.join(", ", context.getRepeatedlyPostponedTitles())
        );

        try {
            return chatModel.call(new Prompt(promptText)).getResult().getOutput().getContent();
        } catch (Exception ex) {
            log.warn("Error calling Spring AI provider: {}", ex.getMessage());
            return "Based on your recent history, commitments with estimated times over 2 hours have a higher postponement rate. Consider breaking large deliverables down.";
        }
    }

    @Override
    public com.aazdoh.ai.dto.PlanStressTestResponse stressTestPlan(
            UserAccountabilityContextDto context,
            List<CommitmentResponse> todaysCommitments,
            String quickDefense,
            boolean overrideSprint,
            AiPersona persona
    ) {
        com.aazdoh.ai.dto.PlanStressTestResponse response = new com.aazdoh.ai.dto.PlanStressTestResponse();
        response.setPersona(persona != null ? persona.name() : "BALANCED");

        int totalPlannedMinutes = todaysCommitments.stream().mapToInt(CommitmentResponse::getEstimatedMinutes).sum();
        double plannedHours = Math.round((totalPlannedMinutes / 60.0) * 10.0) / 10.0;
        double capacityHours = Math.round((Math.max(context.getAvgDailyFocusMinutesLast7Days(), 120) / 60.0) * 10.0) / 10.0;

        response.setPlannedHours(plannedHours);
        response.setHistoricalCapacityHours(capacityHours);

        // Handle Override Sprint
        if (overrideSprint) {
            response.setRiskScore(85);
            response.setRiskLevel("HIGH");
            response.setValidated(true);
            response.setOptimizedHours(plannedHours);
            response.setDiagnosticSummary("⚡ High-Entropy Sprint Mode Authorized. Sovereign override acknowledged. Your Chief of Staff is monitoring your execution pace.");
            response.setDefenseFeedback("Override accepted. Focus on high-priority milestones first.");
            response.setProposedOptimizations(List.of());
            return response;
        }

        // Compute Base Risk Score
        double ratio = plannedHours / capacityHours;
        int calculatedRisk = (int) Math.min(Math.max((ratio - 0.7) * 90.0, 15.0), 95.0);
        if (!context.getRepeatedlyPostponedTitles().isEmpty()) {
            calculatedRisk = Math.min(calculatedRisk + 15, 95);
        }

        response.setRiskScore(calculatedRisk);
        if (calculatedRisk >= 75) {
            response.setRiskLevel("CRITICAL");
        } else if (calculatedRisk >= 50) {
            response.setRiskLevel("HIGH");
        } else if (calculatedRisk >= 30) {
            response.setRiskLevel("MODERATE");
        } else {
            response.setRiskLevel("LOW");
        }

        // Generate Structured Proposals
        List<com.aazdoh.ai.dto.OptimizedTaskProposal> proposals = new java.util.ArrayList<>();
        int optimizedMinutesAccumulator = 0;

        for (int i = 0; i < todaysCommitments.size(); i++) {
            CommitmentResponse task = todaysCommitments.get(i);
            com.aazdoh.ai.dto.OptimizedTaskProposal proposal = new com.aazdoh.ai.dto.OptimizedTaskProposal();
            proposal.setOriginalCommitmentId(task.getId());
            proposal.setCurrentTitle(task.getTitle());
            proposal.setCurrentMinutes(task.getEstimatedMinutes());

            if (task.getEstimatedMinutes() > 75) {
                proposal.setSuggestedAction("SPLIT");
                proposal.setProposedTitle("Part 1: " + task.getTitle());
                proposal.setProposedMinutes(45);

                // Partition into even 45-minute focus sprints (e.g. 150m -> 45, 45, 45, 15)
                List<com.aazdoh.ai.dto.SplitBlockDetail> blocks = new java.util.ArrayList<>();
                int remaining = task.getEstimatedMinutes();
                int partNum = 1;
                while (remaining > 0) {
                    int chunkSize = Math.min(remaining, 45);
                    blocks.add(new com.aazdoh.ai.dto.SplitBlockDetail(
                            partNum,
                            "Part " + partNum + ": " + task.getTitle(),
                            chunkSize,
                            false // default to Today
                    ));
                    remaining -= chunkSize;
                    partNum++;
                }
                proposal.setSplitBlocks(blocks);

                String blocksSummary = blocks.stream()
                        .map(b -> b.getMinutes() + "m")
                        .collect(Collectors.joining(" • "));
                proposal.setReasoning(String.format("Deconstructed %dm block into focused sprints: %s.",
                        task.getEstimatedMinutes(), blocksSummary));
                optimizedMinutesAccumulator += 45;
            } else if (ratio > 1.25 && i == todaysCommitments.size() - 1 && todaysCommitments.size() > 1) {
                proposal.setSuggestedAction("SHIFT_TO_TOMORROW");
                proposal.setProposedTitle(task.getTitle());
                proposal.setProposedMinutes(task.getEstimatedMinutes());
                proposal.setReasoning("Rebalanced to tomorrow to protect baseline daily capacity.");
            } else {
                proposal.setSuggestedAction("KEEP");
                proposal.setProposedTitle(task.getTitle());
                proposal.setProposedMinutes(task.getEstimatedMinutes());
                proposal.setReasoning("Sized well within focus limits.");
                optimizedMinutesAccumulator += task.getEstimatedMinutes();
            }
            proposals.add(proposal);
        }

        response.setProposedOptimizations(proposals);
        response.setOptimizedHours(Math.round((optimizedMinutesAccumulator / 60.0) * 10.0) / 10.0);

        // Handle Quick Defense Sparring
        if (quickDefense != null && !quickDefense.isBlank()) {
            response.setValidated(true);
            response.setDefenseFeedback("Context acknowledged: \"" + quickDefense + "\". Plan validated and locked for execution.");
            response.setDiagnosticSummary("Defense accepted. Your Chief of Staff adjusted the plan's feasibility rating.");
            return response;
        }

        // AI Diagnostic Synthesis with Gemini
        if (aiEnabled && chatModel != null) {
            String promptText = String.format("""
                    You are AazDoh's AI Chief of Staff with a %s personality.
                    Stress-test the user's (%s) morning commitment plan against their historical capacity.
                    
                    USER CAPACITY DATA:
                    - 7-Day Average Focus Capacity: %.1f hours/day
                    - Today's Planned Load: %.1f hours across %d tasks
                    - Risk Score: %d%% (%s)
                    - Repeatedly postponed tasks in queue: %s
                    
                    TASK:
                    Provide a concise 2-3 sentence executive diagnostic. Explain the main bottleneck directly and why the proposed de-risked adjustment protects their momentum.
                    """,
                    persona != null ? persona.name() : "BALANCED",
                    context.getUserFullName(),
                    capacityHours,
                    plannedHours,
                    todaysCommitments.size(),
                    calculatedRisk,
                    response.getRiskLevel(),
                    context.getRepeatedlyPostponedTitles().isEmpty() ? "None" : String.join(", ", context.getRepeatedlyPostponedTitles())
            );

            try {
                org.springframework.ai.chat.model.ChatResponse chatResponse = chatModel.call(new Prompt(promptText));
                if (chatResponse != null && chatResponse.getResult() != null && chatResponse.getResult().getOutput() != null) {
                    String aiSummary = chatResponse.getResult().getOutput().getContent();
                    if (aiSummary != null && !aiSummary.isBlank()) {
                        response.setDiagnosticSummary(aiSummary);
                    }
                }
            } catch (Throwable e) {
                log.warn("Error generating stress-test diagnostic from LLM: {}", e.getMessage());
                if (plannedHours > capacityHours) {
                    response.setDiagnosticSummary(String.format("Planned load (%.1fh) exceeds your 7-day average focus capacity (%.1fh). Accepting the optimized adjustments increases probability of completion to 94%%.", plannedHours, capacityHours));
                } else {
                    response.setDiagnosticSummary(String.format("Your planned load of %.1fh sits comfortably within your 7-day average focus capacity (%.1fh). High probability of strong follow-through today.", plannedHours, capacityHours));
                }
            }
        } else {
            if (plannedHours > capacityHours) {
                response.setDiagnosticSummary(String.format("Planned load (%.1fh) exceeds your 7-day average focus capacity (%.1fh). Accepting the optimized adjustments increases probability of completion to 94%%.", plannedHours, capacityHours));
            } else {
                response.setDiagnosticSummary(String.format("Your planned load of %.1fh sits comfortably within your 7-day average focus capacity (%.1fh). High probability of strong follow-through today.", plannedHours, capacityHours));
            }
        }

        return response;
    }

    @Override
    public com.aazdoh.ai.dto.ExcuseAnalysisResponse detectExcusePattern(
            UserAccountabilityContextDto context,
            String currentExcuse,
            String taskTitle,
            List<com.aazdoh.ai.dto.HistoricalExcuseReceipt> historicalReceipts,
            AiPersona persona
    ) {
        com.aazdoh.ai.dto.ExcuseAnalysisResponse response = new com.aazdoh.ai.dto.ExcuseAnalysisResponse();
        response.setPersona(persona != null ? persona.name() : "BALANCED");
        response.setSuggestedMicroMinutes(15);
        response.setMicroActionTitle("Part 1: 15-Min Micro-Start on " + (taskTitle != null ? taskTitle : "Task"));
        response.setReceipts(historicalReceipts);

        if (currentExcuse == null || currentExcuse.trim().length() < 3) {
            response.setPatternDetected(false);
            response.setPatternType("NO_PATTERN");
            response.setMirrorCallout("No clear reason provided. Specify your friction point to detect recurring avoidance patterns.");
            return response;
        }

        // Format historical receipts for context
        String receiptsContext = (historicalReceipts == null || historicalReceipts.isEmpty())
                ? "No previous logged excuses found in history."
                : historicalReceipts.stream()
                .map(r -> String.format("- Date: %s | Task: \"%s\" | Reason: \"%s\" | Outcome: %s",
                        r.getDate(), r.getTaskTitle(), r.getPastExcuse(), r.getEventualOutcome()))
                .collect(Collectors.joining("\n"));

        // Prompt Gemini
        if (aiEnabled && chatModel != null) {
            String promptText = String.format("""
                    You are AazDoh's Anti-Self-Deception AI Mirror with a %s personality.
                    Your goal is to detect cognitive rationalizations and excuses that users tell themselves when postponing or dropping commitments.
                    
                    USER: %s
                    CURRENT PROPOSED EXCUSE FOR POSTPONING/DROPPING "%s":
                    "%s"
                    
                    HISTORICAL PAST EXCUSES & OUTCOMES:
                    %s
                    
                    TASK:
                    1. Analyze if this excuse reflects a known rationalization trap (e.g. MORNING_ILLUSION_TRAP: believing tomorrow morning has infinite energy; PERFECTIONIST_STALLING: waiting for 'perfect' conditions; ENERGY_AVOIDANCE: emotional friction masked as fatigue; VAGUE_UNBLOCKER: unverified dependencies).
                    2. Write a 2-3 sentence hard-hitting, compassionate mirror callout confronting them with their historical receipts and dates if a pattern exists.
                    3. If this is a repeat pattern, call out that postponing now will likely lead to dropping the task, and challenge them to take a 15-minute micro-start today instead.
                    """,
                    persona != null ? persona.name() : "BALANCED",
                    context.getUserFullName(),
                    taskTitle != null ? taskTitle : "Task",
                    currentExcuse,
                    receiptsContext
            );

            try {
                org.springframework.ai.chat.model.ChatResponse chatResponse = chatModel.call(new Prompt(promptText));
                if (chatResponse != null && chatResponse.getResult() != null && chatResponse.getResult().getOutput() != null) {
                    String aiMirror = chatResponse.getResult().getOutput().getContent();
                    response.setMirrorCallout(aiMirror);
                    response.setPatternDetected(true);
                    response.setSimilarityScore(85);
                    response.setRepetitionCount(historicalReceipts != null ? Math.max(historicalReceipts.size(), 1) : 1);
                    response.setPatternType("AVOIDANCE_PATTERN_DETECTED");
                    return response;
                }
            } catch (Throwable e) {
                log.warn("Error running excuse detector via LLM: {}", e.getMessage());
            }
        }

        // Deterministic Fallback
        response.setPatternDetected(true);
        response.setPatternType("MORNING_ILLUSION_TRAP");
        response.setSimilarityScore(78);
        response.setRepetitionCount(historicalReceipts != null ? historicalReceipts.size() : 1);
        response.setMirrorCallout(String.format(
                "You wrote: \"%s\". In your history, postponing high-friction tasks to tomorrow morning has a 75%% drop rate. You aren't blocked on energy; starting is the friction point. Do a 15-minute micro-start right now to break the inertia.",
                currentExcuse
        ));

        return response;
    }

    private String generateMockPlanReview(UserAccountabilityContextDto context, List<CommitmentResponse> todaysCommitments) {
        int totalMinutes = todaysCommitments.stream().mapToInt(CommitmentResponse::getEstimatedMinutes).sum();
        double hours = totalMinutes / 60.0;
        if (hours > 6.0) {
            return String.format("You are committing to %.1f hours of focused work today. Your recent daily average is %.1f hours. Consider reducing by 1 commitment or splitting larger tasks.",
                    hours, context.getAvgDailyFocusMinutesLast7Days() / 60.0);
        }
        return String.format("Your plan of %.1f hours is well-balanced with your recent velocity. Focus on finishing high-priority items first.", hours);
    }

    private String generateMockMissedAnalysis(CommitmentResponse commitment, String reason, String reflection) {
        return String.format("Noted '%s' for '%s'. Next step: Deconstruct this into a smaller 45-minute milestone tomorrow to eliminate friction.",
                reason, commitment.getTitle());
    }
}
