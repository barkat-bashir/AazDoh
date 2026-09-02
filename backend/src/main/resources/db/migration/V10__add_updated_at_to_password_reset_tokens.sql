-- Add missing updated_at column to password_reset_tokens for BaseEntity schema validation
ALTER TABLE password_reset_tokens 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
