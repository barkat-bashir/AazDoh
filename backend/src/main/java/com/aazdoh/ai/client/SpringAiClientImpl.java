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
