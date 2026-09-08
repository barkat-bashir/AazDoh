package com.aazdoh.ai.dto;

import java.util.List;

public record AgentStreamEvent(
        String type,           // "STEP", "DELTA", "DONE", "ERROR"
        String message,        // Human-readable step label (e.g. "🔍 Fetching commitments...")
        String delta,          // Incremental text chunk
        List<AgentActionReceipt> receipts,
        boolean undoAvailable,
        String cognitiveWarning
) {
    public static AgentStreamEvent step(String message) {
        return new AgentStreamEvent("STEP", message, null, null, false, null);
    }

    public static AgentStreamEvent delta(String delta) {
        return new AgentStreamEvent("DELTA", null, delta, null, false, null);
    }

    public static AgentStreamEvent done(String fullMessage, List<AgentActionReceipt> receipts, boolean undoAvailable, String cognitiveWarning) {
        return new AgentStreamEvent("DONE", fullMessage, null, receipts, undoAvailable, cognitiveWarning);
    }

    public static AgentStreamEvent error(String error) {
        return new AgentStreamEvent("ERROR", error, null, null, false, null);
    }
}
