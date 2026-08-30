-- V3: Add origin commitment reference and postponement count for O(1) lineage tracking

ALTER TABLE commitments 
ADD COLUMN IF NOT EXISTS origin_commitment_id UUID REFERENCES commitments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS postponement_count INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_commitments_origin_id ON commitments(origin_commitment_id);
CREATE INDEX IF NOT EXISTS idx_commitments_date_status ON commitments(commitment_date, status);
