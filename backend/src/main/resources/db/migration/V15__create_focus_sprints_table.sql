-- Migration V15: Create focus_sprints table for telemetry & execution tracking
CREATE TABLE IF NOT EXISTS focus_sprints (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    commitment_id UUID REFERENCES commitments(id) ON DELETE SET NULL,
    duration_minutes INT NOT NULL,
    actual_seconds_spent INT NOT NULL,
    mode VARCHAR(30) NOT NULL DEFAULT 'FOCUS',
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    distractions_count INT NOT NULL DEFAULT 0,
    distraction_notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_focus_sprints_user_id ON focus_sprints(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sprints_commitment_id ON focus_sprints(commitment_id);
CREATE INDEX IF NOT EXISTS idx_focus_sprints_completed_at ON focus_sprints(completed_at);
