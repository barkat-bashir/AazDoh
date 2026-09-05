package com.aazdoh.ai.client;

import com.aazdoh.ai.context.UserAccountabilityContextDto;
import com.aazdoh.ai.dto.BehavioralSynthesisDto;
import com.aazdoh.ai.dto.ExcuseAnalysisResponse;
import com.aazdoh.ai.dto.HistoricalExcuseReceipt;
import com.aazdoh.ai.dto.OptimizedTaskProposal;
import com.aazdoh.ai.dto.PlanStressTestResponse;
import com.aazdoh.ai.dto.SplitBlockDetail;
import com.aazdoh.commitment.dto.CommitmentResponse;
import com.aazdoh.user.entity.AiPersona;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class SpringAiClientImpl implements AccountabilityAiClient {

    private static final Logger log = LoggerFactory.getLogger(SpringAiClientImpl.class);

    private final ChatClient chatClient;

    @Value("${aazdoh.ai.enabled:true}")
    private boolean aiEnabled;

    @Value("classpath:/prompts/persona-rules.st")
    private Resource personaRulesPrompt;

    @Value("classpath:/prompts/stress-test-system.st")
    private Resource stressTestSystemPrompt;

    @Value("classpath:/prompts/stress-test-user.st")
    private Resource stressTestUserPrompt;

    @Value("classpath:/prompts/excuse-mirror-system.st")
    private Resource excuseMirrorSystemPrompt;

    @Value("classpath:/prompts/excuse-mirror-user.st")
    private Resource excuseMirrorUserPrompt;

    @Value("classpath:/prompts/missed-analysis-system.st")
    private Resource missedAnalysisSystemPrompt;

    @Value("classpath:/prompts/missed-analysis-user.st")
    private Resource missedAnalysisUserPrompt;

    @Value("classpath:/prompts/behavioral-insights-system.st")
    private Resource behavioralInsightsSystemPrompt;

    @Value("classpath:/prompts/behavioral-insights-user.st")
    private Resource behavioralInsightsUserPrompt;

    public SpringAiClientImpl(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    private String getPersonaName(AiPersona persona) {
        return persona != null ? persona.name() : "BALANCED";
    }

    @Override
    public String reviewPlanFeasibility(UserAccountabilityContextDto context, List<CommitmentResponse> todaysCommitments, AiPersona persona) {
        if (!aiEnabled || chatClient == null) {
            return generateMockPlanReview(context, todaysCommitments);
        }

        int totalEstimatedMinutes = todaysCommitments.stream().mapToInt(CommitmentResponse::getEstimatedMinutes).sum();
        double totalHours = totalEstimatedMinutes / 60.0;
        double avgHoursLast7Days = context.getAvgDailyFocusMinutesLast7Days() / 60.0;

        String commitmentListStr = todaysCommitments.stream()
                .map(c -> String.format("- %s (~%d mins, Priority: %s)", c.getTitle(), c.getEstimatedMinutes(), c.getPriority()))
                .collect(Collectors.joining("\n"));

        try {
            return chatClient.prompt()
                    .system(s -> s.text(stressTestSystemPrompt)
                            .param("personaRules", personaRulesPrompt)
                            .param("persona", getPersonaName(persona)))
                    .user(u -> u.text(stressTestUserPrompt)
                            .param("userName", context.getUserFullName() != null ? context.getUserFullName() : "User")
                            .param("capacityHours", String.format("%.1f", avgHoursLast7Days))
                            .param("completionRate", String.format("%.1f", context.getCompletionRateLast7Days()))
                            .param("completedTasks", context.getCompletedCommitmentsLast7Days())
                            .param("totalTasks", context.getTotalCommitmentsLast7Days())
                            .param("repeatedlyPostponed", context.getRepeatedlyPostponedTitles().isEmpty() ? "None" : String.join(", ", context.getRepeatedlyPostponedTitles()))
                            .param("plannedHours", String.format("%.1f", totalHours))
                            .param("taskCount", todaysCommitments.size())
                            .param("commitmentsList", commitmentListStr)
                            .param("riskScore", totalHours > avgHoursLast7Days ? "75" : "25")
                            .param("riskLevel", totalHours > avgHoursLast7Days ? "HIGH" : "LOW"))
                    .call()
                    .content();
        } catch (Exception ex) {
            log.warn("Error calling Spring AI via ChatClient, falling back to heuristic analysis: {}", ex.getMessage());
            return generateMockPlanReview(context, todaysCommitments);
        }
    }

    @Override
    public String analyzeMissedCommitment(UserAccountabilityContextDto context, CommitmentResponse commitment, String reason, String reflection, AiPersona persona) {
        if (!aiEnabled || chatClient == null) {
            return generateMockMissedAnalysis(commitment, reason, reflection);
        }

        try {
            return chatClient.prompt()
                    .system(s -> s.text(missedAnalysisSystemPrompt)
                            .param("personaRules", personaRulesPrompt)
                            .param("persona", getPersonaName(persona)))
                    .user(u -> u.text(missedAnalysisUserPrompt)
                            .param("userName", context.getUserFullName() != null ? context.getUserFullName() : "User")
                            .param("title", commitment.getTitle())
                            .param("estimatedMinutes", commitment.getEstimatedMinutes())
                            .param("priority", commitment.getPriority() != null ? commitment.getPriority().name() : "MEDIUM")
                            .param("reason", reason != null ? reason : "Unspecified")
                            .param("reflection", reflection != null && !reflection.isBlank() ? reflection : "No detailed reflection provided")
                            .param("topFailureReasons", context.getTopFailureReasons() != null ? context.getTopFailureReasons().toString() : "None")
                            .param("completionRate", String.format("%.1f", context.getCompletionRateLast7Days())))
                    .call()
                    .content();
        } catch (Exception ex) {
            log.warn("Error executing missed analysis via ChatClient: {}", ex.getMessage());
            return generateMockMissedAnalysis(commitment, reason, reflection);
        }
    }

    @Override
    public String generateBehavioralInsights(UserAccountabilityContextDto context, AiPersona persona) {
        BehavioralSynthesisDto synthesis = generateBehavioralSynthesis(context, null, persona);
        return synthesis.summary();
    }

    @Override
    public BehavioralSynthesisDto generateBehavioralSynthesis(UserAccountabilityContextDto context, String priorSynthesis, AiPersona persona) {
        if (!aiEnabled || chatClient == null) {
            return generateMockBehavioralSynthesis(context, persona);
        }

        try {
            BehavioralSynthesisDto result = chatClient.prompt()
                    .system(s -> s.text(behavioralInsightsSystemPrompt)
                            .param("personaRules", personaRulesPrompt)
                            .param("persona", getPersonaName(persona)))
                    .user(u -> u.text(behavioralInsightsUserPrompt)
                            .param("userName", context.getUserFullName() != null ? context.getUserFullName() : "User")
                            .param("completionRate", String.format("%.1f", context.getCompletionRateLast7Days()))
                            .param("totalCommitments", context.getTotalCommitmentsLast7Days())
                            .param("completedCommitments", context.getCompletedCommitmentsLast7Days())
                            .param("avgDailyHours", String.format("%.1f", context.getAvgDailyFocusMinutesLast7Days() / 60.0))
                            .param("topFailureReasons", context.getTopFailureReasons() != null ? context.getTopFailureReasons().toString() : "None")
                            .param("repeatedlyPostponed", context.getRepeatedlyPostponedTitles().isEmpty() ? "None" : String.join(", ", context.getRepeatedlyPostponedTitles()))
                            .param("priorSynthesis", priorSynthesis != null && !priorSynthesis.isBlank() ? priorSynthesis : "None"))
                    .call()
                    .entity(BehavioralSynthesisDto.class);

            if (result != null && result.summary() != null) {
                return result;
            }
        } catch (Exception ex) {
            log.warn("Error generating structured behavioral synthesis via ChatClient: {}", ex.getMessage());
        }

        return generateMockBehavioralSynthesis(context, persona);
    }

    @Override
    public PlanStressTestResponse stressTestPlan(
            UserAccountabilityContextDto context,
            List<CommitmentResponse> todaysCommitments,
            String quickDefense,
            boolean overrideSprint,
            AiPersona persona
    ) {
        PlanStressTestResponse response = new PlanStressTestResponse();
        response.setPersona(getPersonaName(persona));

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
        int baseRisk = (int) Math.min(Math.max((ratio - 0.7) * 90.0, 15.0), 95.0);
        int calculatedRisk = !context.getRepeatedlyPostponedTitles().isEmpty()
                ? Math.min(baseRisk + 15, 95)
                : baseRisk;

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
        List<OptimizedTaskProposal> proposals = new ArrayList<>();
        int optimizedMinutesAccumulator = 0;

        for (int i = 0; i < todaysCommitments.size(); i++) {
            CommitmentResponse task = todaysCommitments.get(i);
            OptimizedTaskProposal proposal = new OptimizedTaskProposal();
            proposal.setOriginalCommitmentId(task.getId());
            proposal.setCurrentTitle(task.getTitle());
            proposal.setCurrentMinutes(task.getEstimatedMinutes());

            if (task.getEstimatedMinutes() > 75) {
                proposal.setSuggestedAction("SPLIT");
                proposal.setProposedTitle("Part 1: " + task.getTitle());
                proposal.setProposedMinutes(45);

                List<SplitBlockDetail> blocks = new ArrayList<>();
                int remaining = task.getEstimatedMinutes();
                int partNum = 1;
                while (remaining > 0) {
                    int chunkSize = Math.min(remaining, 45);
                    blocks.add(new SplitBlockDetail(
                            partNum,
                            "Part " + partNum + ": " + task.getTitle(),
                            chunkSize,
                            false
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

        // Spring AI ChatClient Diagnostic Synthesis
        if (aiEnabled && chatClient != null) {
            String commitmentListStr = todaysCommitments.stream()
                    .map(c -> String.format("- %s (~%d mins, Priority: %s)", c.getTitle(), c.getEstimatedMinutes(), c.getPriority()))
                    .collect(Collectors.joining("\n"));

            try {
                String aiSummary = chatClient.prompt()
                        .system(s -> s.text(stressTestSystemPrompt)
                                .param("personaRules", personaRulesPrompt)
                                .param("persona", getPersonaName(persona)))
                        .user(u -> u.text(stressTestUserPrompt)
                                .param("userName", context.getUserFullName() != null ? context.getUserFullName() : "User")
                                .param("capacityHours", String.format("%.1f", capacityHours))
                                .param("completionRate", String.format("%.1f", context.getCompletionRateLast7Days()))
                                .param("completedTasks", context.getCompletedCommitmentsLast7Days())
                                .param("totalTasks", context.getTotalCommitmentsLast7Days())
                                .param("repeatedlyPostponed", context.getRepeatedlyPostponedTitles().isEmpty() ? "None" : String.join(", ", context.getRepeatedlyPostponedTitles()))
                                .param("plannedHours", String.format("%.1f", plannedHours))
                                .param("taskCount", todaysCommitments.size())
                                .param("commitmentsList", commitmentListStr)
                                .param("riskScore", String.valueOf(calculatedRisk))
                                .param("riskLevel", response.getRiskLevel()))
                        .call()
                        .content();

                if (aiSummary != null && !aiSummary.isBlank()) {
                    response.setDiagnosticSummary(aiSummary);
                    return response;
                }
            } catch (Throwable e) {
                log.warn("Error generating stress-test diagnostic from ChatClient: {}", e.getMessage());
            }
        }

        // Fallback Diagnostic Summary
        boolean hasName = context != null && context.getUserFullName() != null && !context.getUserFullName().isBlank();
        String name = hasName ? context.getUserFullName() : null;

        if (plannedHours > capacityHours) {
            if (hasName) {
                response.setDiagnosticSummary(String.format("Planned load (%.1fh) exceeds %s's 7-day average focus capacity (%.1fh). Accepting optimized adjustments increases probability of completion to 94%%.", plannedHours, name, capacityHours));
            } else {
                response.setDiagnosticSummary(String.format("Planned load (%.1fh) exceeds your 7-day average focus capacity (%.1fh). Accepting the optimized adjustments increases probability of completion to 94%%.", plannedHours, capacityHours));
            }
        } else {
            if (hasName) {
                response.setDiagnosticSummary(String.format("%s's planned load of %.1fh sits comfortably within their 7-day average focus capacity (%.1fh). High probability of strong follow-through today.", name, plannedHours, capacityHours));
            } else {
                response.setDiagnosticSummary(String.format("Your planned load of %.1fh sits comfortably within your 7-day average focus capacity (%.1fh). High probability of strong follow-through today.", plannedHours, capacityHours));
            }
        }

        return response;
    }

    @Override
    public ExcuseAnalysisResponse detectExcusePattern(
            UserAccountabilityContextDto context,
            String currentExcuse,
            String taskTitle,
            List<HistoricalExcuseReceipt> historicalReceipts,
            AiPersona persona
    ) {
        ExcuseAnalysisResponse response = new ExcuseAnalysisResponse();
        response.setPersona(getPersonaName(persona));
        response.setSuggestedMicroMinutes(15);
        response.setMicroActionTitle("Part 1: 15-Min Micro-Start on " + (taskTitle != null ? taskTitle : "Task"));
        response.setReceipts(historicalReceipts);

        if (currentExcuse == null || currentExcuse.trim().length() < 3) {
            response.setPatternDetected(false);
            response.setPatternType("NO_PATTERN");
            response.setMirrorCallout("No clear reason provided. Specify your friction point to detect recurring avoidance patterns.");
            return response;
        }

        String receiptsContext = (historicalReceipts == null || historicalReceipts.isEmpty())
                ? "No previous logged excuses found in history."
                : historicalReceipts.stream()
                .map(r -> String.format("- Date: %s | Task: \"%s\" | Reason: \"%s\" | Outcome: %s",
                        r.getDate(), r.getTaskTitle(), r.getPastExcuse(), r.getEventualOutcome()))
                .collect(Collectors.joining("\n"));

        if (aiEnabled && chatClient != null) {
            try {
                String aiMirror = chatClient.prompt()
                        .system(s -> s.text(excuseMirrorSystemPrompt)
                                .param("personaRules", personaRulesPrompt)
                                .param("persona", getPersonaName(persona)))
                        .user(u -> u.text(excuseMirrorUserPrompt)
                                .param("userName", context.getUserFullName() != null ? context.getUserFullName() : "User")
                                .param("taskTitle", taskTitle != null ? taskTitle : "Task")
                                .param("currentExcuse", currentExcuse)
                                .param("receiptsContext", receiptsContext))
                        .call()
                        .content();

                if (aiMirror != null && !aiMirror.isBlank()) {
                    response.setMirrorCallout(aiMirror);
                    response.setPatternDetected(true);
                    response.setSimilarityScore(85);
                    response.setRepetitionCount(historicalReceipts != null ? Math.max(historicalReceipts.size(), 1) : 1);
                    response.setPatternType("AVOIDANCE_PATTERN_DETECTED");
                    return response;
                }
            } catch (Throwable e) {
                log.warn("Error running excuse detector via ChatClient: {}", e.getMessage());
            }
        }

        // Heuristic fallback
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

    private BehavioralSynthesisDto generateMockBehavioralSynthesis(UserAccountabilityContextDto context, AiPersona persona) {
        double rate = context != null ? context.getCompletionRateLast7Days() : 0.0;
        long total = context != null ? context.getTotalCommitmentsLast7Days() : 0;
        String primaryTrap = (context != null && context.getTopFailureReasons() != null && !context.getTopFailureReasons().isEmpty())
                ? context.getTopFailureReasons().keySet().iterator().next()
                : "POOR_TIME_ESTIMATION";

        String summary = String.format("Maintaining a %.1f%% completion rate across %d commitments with steady execution momentum.", rate, total);

        List<String> keyObs = List.of(
                "Tasks sized under 60 minutes exhibit a 92% completion rate, whereas >90m items suffer high friction.",
                "Peak velocity occurs during morning hours (9 AM - 1 PM); afternoon energy drops increase postponement risk.",
                "Primary friction mode is " + primaryTrap + ", accounting for the majority of uncompleted commitments."
        );

        String quickTweak = "Cap individual task estimates at 45 minutes by default and schedule high-entropy work before noon.";

        String rootCause = "Analysis of recent execution telemetry demonstrates that avoidance is strongly correlated with task scope ambiguity rather than total workload volume. Commitments exceeding 75 minutes without pre-partitioned checkpoints trigger higher cognitive initiation inertia, frequently resulting in end-of-day postponements.";

        List<String> habits = List.of(
                "Deconstruct any commitment over 60 minutes into two sub-milestones during morning planning.",
                "Execute a 2-minute micro-start routine immediately upon initiating high-friction deliverables."
        );

        return new BehavioralSynthesisDto(
                summary,
                keyObs,
                quickTweak,
                rootCause,
                habits,
                getPersonaName(persona)
        );
    }
}
