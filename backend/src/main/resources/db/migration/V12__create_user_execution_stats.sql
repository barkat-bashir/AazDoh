-- Level 2: Event-Driven Rollup Table for O(1) Pre-Aggregated 7-Day Velocity & Behavioral Patterns
CREATE TABLE IF NOT EXISTS user_execution_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    rolling_7d_total_tasks BIGINT NOT NULL DEFAULT 0,
    rolling_7d_completed_tasks BIGINT NOT NULL DEFAULT 0,
    rolling_7d_completion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.0,
    rolling_7d_focus_minutes INT NOT NULL DEFAULT 0,
    rolling_7d_avg_daily_focus_minutes DECIMAL(7, 2) NOT NULL DEFAULT 0.0,
    primary_failure_trap VARCHAR(50),
    failure_breakdown_json TEXT,
    repeatedly_postponed_titles_json TEXT,
    last_computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_execution_stats_user_id ON user_execution_stats(user_id);
