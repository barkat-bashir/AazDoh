-- Create table to cache and persist AI stress test summaries and plan snapshots
CREATE TABLE IF NOT EXISTS ai_stress_test_snapshots (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    commitment_date DATE NOT NULL,
    plan_hash VARCHAR(64) NOT NULL,
    risk_score INT NOT NULL,
    risk_level VARCHAR(30) NOT NULL,
    diagnostic_summary TEXT NOT NULL,
    planned_hours DOUBLE PRECISION NOT NULL,
    capacity_hours DOUBLE PRECISION NOT NULL,
    optimized_hours DOUBLE PRECISION NOT NULL,
    proposals_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_date_plan_hash UNIQUE (user_id, commitment_date, plan_hash)
);

CREATE INDEX IF NOT EXISTS idx_stress_test_user_date ON ai_stress_test_snapshots(user_id, commitment_date);
