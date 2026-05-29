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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class AiAccountabilityService {

    private final AccountabilityContextBuilder contextBuilder;
    private final AccountabilityAiClient aiClient;
    private final CommitmentService commitmentService;
    private final ReviewService reviewService;
    private final UserService userService;
    private final AiInteractionRepository aiInteractionRepository;

    public AiAccountabilityService(
            AccountabilityContextBuilder contextBuilder,
            AccountabilityAiClient aiClient,
            CommitmentService commitmentService,
            ReviewService reviewService,
            UserService userService,
            AiInteractionRepository aiInteractionRepository
    ) {
        this.contextBuilder = contextBuilder;
        this.aiClient = aiClient;
        this.commitmentService = commitmentService;
        this.reviewService = reviewService;
        this.userService = userService;
        this.aiInteractionRepository = aiInteractionRepository;
    }

    @Transactional
    public AiFeedbackResponse reviewDailyPlan(UUID userId, LocalDate date) {
        User user = userService.findUserById(userId);
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<CommitmentResponse> todaysCommitments = commitmentService.getTodayCommitments(userId, targetDate);

        if (todaysCommitments.isEmpty()) {
            return new AiFeedbackResponse("You have not created any commitments for " + targetDate + " yet. Add your top 2-3 priorities to get started.", user.getAiPersona().name());
        }

        UserAccountabilityContextDto context = contextBuilder.buildContext(userId);
        String feedback = aiClient.reviewPlanFeasibility(context, todaysCommitments, user.getAiPersona());

        // Save interaction
        aiInteractionRepository.save(new AiInteraction(user, "DAILY_PLAN_REVIEW", "Review commitments for " + targetDate, feedback));

        return new AiFeedbackResponse(feedback, user.getAiPersona().name());
    }

    @Transactional
    public AiFeedbackResponse reviewMissedCommitment(UUID userId, UUID commitmentId) {
        User user = userService.findUserById(userId);
        CommitmentResponse commitment = commitmentService.getCommitmentById(userId, commitmentId);
        ReviewResponse review = reviewService.getReviewByCommitmentId(userId, commitmentId);

        UserAccountabilityContextDto context = contextBuilder.buildContext(userId);
        String reasonStr = review.getFailureReason() != null ? review.getFailureReason().name() : "Unspecified";
        String feedback = aiClient.analyzeMissedCommitment(context, commitment, reasonStr, review.getReflection(), user.getAiPersona());

        aiInteractionRepository.save(new AiInteraction(user, "MISSED_COMMITMENT_ANALYSIS", "Analysis for " + commitment.getTitle(), feedback));

        return new AiFeedbackResponse(feedback, user.getAiPersona().name());
    }

    public AiFeedbackResponse getBehavioralInsights(UUID userId) {
        User user = userService.findUserById(userId);
        UserAccountabilityContextDto context = contextBuilder.buildContext(userId);
        String feedback = aiClient.generateBehavioralInsights(context, user.getAiPersona());

        return new AiFeedbackResponse(feedback, user.getAiPersona().name());
    }
}
