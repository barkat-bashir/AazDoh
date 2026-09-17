-- Migration V19: Add day_phase column to commitments table for optional day phasing (Morning, Day, Evening)
ALTER TABLE commitments ADD COLUMN IF NOT EXISTS day_phase VARCHAR(30);
CREATE INDEX IF NOT EXISTS idx_commitments_day_phase ON commitments(day_phase);
