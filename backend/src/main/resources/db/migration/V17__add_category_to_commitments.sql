-- Migration V17: Add category column to commitments table for work categorization
ALTER TABLE commitments ADD COLUMN IF NOT EXISTS category VARCHAR(30) NOT NULL DEFAULT 'DEEP_WORK';
CREATE INDEX IF NOT EXISTS idx_commitments_category ON commitments(category);
