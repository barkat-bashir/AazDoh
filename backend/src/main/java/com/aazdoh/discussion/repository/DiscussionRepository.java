package com.aazdoh.discussion.repository;

import com.aazdoh.discussion.entity.Discussion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DiscussionRepository extends JpaRepository<Discussion, UUID> {
    Optional<Discussion> findByCommitmentId(UUID commitmentId);
}
