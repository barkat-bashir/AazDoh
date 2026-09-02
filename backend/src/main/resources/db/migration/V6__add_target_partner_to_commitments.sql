-- Add target_partner_id to commitments for granular partner tagging
ALTER TABLE commitments
ADD COLUMN IF NOT EXISTS target_partner_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_commitments_target_partner ON commitments(target_partner_id);
