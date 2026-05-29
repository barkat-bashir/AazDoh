package com.aazdoh.discussion.repository;

import com.aazdoh.discussion.entity.DiscussionMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DiscussionMessageRepository extends JpaRepository<DiscussionMessage, UUID> {
    List<DiscussionMessage> findByDiscussionIdOrderByCreatedAtAsc(UUID discussionId);
}
