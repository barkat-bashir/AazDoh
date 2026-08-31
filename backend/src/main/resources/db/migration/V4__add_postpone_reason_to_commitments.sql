-- V4: Add postpone_reason column to commitments for historical excuse tracking

ALTER TABLE commitments 
ADD COLUMN IF NOT EXISTS postpone_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_commitments_postpone_reason ON commitments(user_id) WHERE postpone_reason IS NOT NULL;
