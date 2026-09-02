package com.aazdoh.discussion.repository;

import com.aazdoh.discussion.entity.DiscussionMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DiscussionMessageRepository extends JpaRepository<DiscussionMessage, UUID> {
    List<DiscussionMessage> findByDiscussionIdOrderByCreatedAtAsc(UUID discussionId);

    @Query("SELECT COUNT(m) FROM DiscussionMessage m JOIN m.discussion d JOIN d.commitment c " +
           "WHERE m.author.id != :userId AND m.readAt IS NULL " +
           "AND (c.user.id = :userId OR c.targetPartnerId = :userId " +
           "     OR EXISTS (SELECT 1 FROM AccountabilityPartnership ap WHERE ap.status = 'ACCEPTED' " +
           "                AND ((ap.requester.id = :userId AND ap.partner.id = c.user.id) " +
           "                     OR (ap.partner.id = :userId AND ap.requester.id = c.user.id))))")
    long countUnreadMessagesForUser(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE DiscussionMessage m SET m.readAt = :now WHERE m.discussion.id = :discussionId AND m.author.id != :userId AND m.readAt IS NULL")
    int markDiscussionAsRead(@Param("discussionId") UUID discussionId, @Param("userId") UUID userId, @Param("now") OffsetDateTime now);

    @Query("SELECT m.discussion.commitment.id, COUNT(m), SUM(CASE WHEN m.author.id != :userId AND m.readAt IS NULL THEN 1 ELSE 0 END) " +
           "FROM DiscussionMessage m " +
           "WHERE m.discussion.commitment.id IN :commitmentIds " +
           "GROUP BY m.discussion.commitment.id")
    List<Object[]> getStatsForCommitments(@Param("commitmentIds") List<UUID> commitmentIds, @Param("userId") UUID userId);
}
