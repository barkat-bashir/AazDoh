-- Add read_at timestamp to discussion_messages to track unread messages
ALTER TABLE discussion_messages
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_discussion_messages_read_at ON discussion_messages(discussion_id, read_at);
