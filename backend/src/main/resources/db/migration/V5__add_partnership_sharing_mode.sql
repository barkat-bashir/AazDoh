-- Add partnership type and sharing direction to accountability_partnerships
ALTER TABLE accountability_partnerships 
ADD COLUMN IF NOT EXISTS share_partner_commitments BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS partnership_type VARCHAR(30) NOT NULL DEFAULT 'MUTUAL';
