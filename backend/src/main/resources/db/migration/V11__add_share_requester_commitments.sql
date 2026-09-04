-- Add share_requester_commitments to accountability_partnerships for sovereign two-way privacy
ALTER TABLE accountability_partnerships 
ADD COLUMN IF NOT EXISTS share_requester_commitments BOOLEAN NOT NULL DEFAULT TRUE;
