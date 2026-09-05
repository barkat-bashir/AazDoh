-- Add behavioral synthesis JSON and timestamp to user_execution_stats
ALTER TABLE user_execution_stats
ADD COLUMN IF NOT EXISTS behavioral_synthesis_json TEXT,
ADD COLUMN IF NOT EXISTS last_synthesized_at TIMESTAMP WITH TIME ZONE;
