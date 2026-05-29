package com.aazdoh.ai.client;

import com.aazdoh.ai.context.UserAccountabilityContextDto;
import com.aazdoh.commitment.dto.CommitmentResponse;
import com.aazdoh.user.entity.AiPersona;

import java.util.List;

public interface AccountabilityAiClient {

    String reviewPlanFeasibility(UserAccountabilityContextDto context, List<CommitmentResponse> todaysCommitments, AiPersona persona);

    String analyzeMissedCommitment(UserAccountabilityContextDto context, CommitmentResponse commitment, String reason, String reflection, AiPersona persona);

    String generateBehavioralInsights(UserAccountabilityContextDto context, AiPersona persona);
}
