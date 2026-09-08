package com.aazdoh.ai.agent;

import java.util.function.Consumer;

/**
 * ThreadLocal progress listener that allows AgentTools and Spring AI Function beans
 * to emit real-time human-readable progress steps (e.g. "🔍 Fetching commitments...",
 * "⚡ Added commitment: LeetCode (60m)...") directly to an active SSE stream.
 */
public final class AgentProgressListener {

    private static final ThreadLocal<Consumer<String>> LISTENER = new ThreadLocal<>();

    private AgentProgressListener() {}

    public static void setListener(Consumer<String> listener) {
        LISTENER.set(listener);
    }

    public static void emit(String stepMessage) {
        Consumer<String> listener = LISTENER.get();
        if (listener != null) {
            try {
                listener.accept(stepMessage);
            } catch (Exception ignored) {
            }
        }
    }

    public static void clear() {
        LISTENER.remove();
    }
}
