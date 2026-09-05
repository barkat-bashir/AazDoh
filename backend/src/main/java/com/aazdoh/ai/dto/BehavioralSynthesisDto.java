package com.aazdoh.ai.dto;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;

import java.util.List;

public record BehavioralSynthesisDto(
        @JsonPropertyDescription("One-sentence punchy assessment of the user's recent execution velocity, under 25 words.")
        String summary,

        @JsonPropertyDescription("Exactly 3 crisp empirical observations about task sizing, energy, or friction points. Under 20 words each.")
        List<String> keyObservations,

        @JsonPropertyDescription("One high-leverage immediate structural habit tweak. Under 25 words.")
        String quickTweak,

        @JsonPropertyDescription("Deep-dive root cause deconstruction of friction traps, task sizing thresholds, and avoidance triggers.")
        String rootCauseDeconstruction,

        @JsonPropertyDescription("List of 2-3 specific tactical habit protocols to implement.")
        List<String> tacticalHabits,

        @JsonPropertyDescription("AI persona used for the evaluation.")
        String persona
) {
}
