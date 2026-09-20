-- Migration V20: Add performance indexes for sub-millisecond query execution and reduced database CPU time

-- 1. Accelerates 60s unread notification poller (findUnreadMessageDetailsForUser)
CREATE INDEX IF NOT EXISTS idx_discussion_messages_unread 
ON discussion_messages(author_id, read_at);

-- 2. Accelerates discussions lookup by commitment
CREATE INDEX IF NOT EXISTS idx_discussions_commitment_id 
ON discussions(commitment_id);

-- 3. Accelerates reviews lookup and failure reason distribution aggregation
CREATE INDEX IF NOT EXISTS idx_reviews_commitment_id 
ON commitment_reviews(commitment_id);

-- 4. Accelerates daily plan loading and soft-deleted filtering
CREATE INDEX IF NOT EXISTS idx_commitments_user_active_date 
ON commitments(user_id, deleted_at, commitment_date);

-- 5. Accelerates user statistics and overdue pending commitment lookups
CREATE INDEX IF NOT EXISTS idx_commitments_status_date_deleted 
ON commitments(status, commitment_date, deleted_at);
