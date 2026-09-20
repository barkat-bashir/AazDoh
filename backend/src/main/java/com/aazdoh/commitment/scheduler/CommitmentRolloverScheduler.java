package com.aazdoh.commitment.scheduler;

import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.user.entity.User;
import com.aazdoh.analytics.service.UserExecutionStatsService;
import com.aazdoh.user.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Component
public class CommitmentRolloverScheduler {

    private static final Logger log = LoggerFactory.getLogger(CommitmentRolloverScheduler.class);

    private final CommitmentRepository commitmentRepository;
    private final UserService userService;
    private final UserExecutionStatsService statsService;

    public CommitmentRolloverScheduler(
            CommitmentRepository commitmentRepository,
            UserService userService,
            UserExecutionStatsService statsService
    ) {
        this.commitmentRepository = commitmentRepository;
        this.userService = userService;
        this.statsService = statsService;
    }

    /**
     * Fire-and-forget asynchronous rollover for a specific active user.
     * Evaluates against the user's exact local timezone without blocking the calling request.
     */
    @Async
    @Transactional
    public void rolloverUserOverdueAsync(UUID userId) {
        if (userId == null) {
            return;
        }
        try {
            User user = userService.findUserById(userId);
            ZoneId userZone;
            try {
                userZone = (user.getTimezone() != null && !user.getTimezone().isBlank())
                        ? ZoneId.of(user.getTimezone())
                        : ZoneId.systemDefault();
            } catch (Exception e) {
                userZone = ZoneId.systemDefault();
            }

            LocalDate userToday = LocalDate.now(userZone);
            int transitioned = commitmentRepository.rolloverOverdueForUser(userId, userToday);
            if (transitioned > 0) {
                log.info("Fire-and-Forget Rollover: Transitioned {} overdue commitments to MISSED for user {}", transitioned, userId);
                statsService.refreshStatsAsync(userId);
            }
        } catch (Exception e) {
            log.warn("Non-blocking async rollover skipped for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Runs daily at 1:00 AM UTC to sweep and roll over stale PENDING commitments past their local day boundary.
     */
    @Scheduled(cron = "${aazdoh.scheduler.rollover-cron:0 0 1 * * *}", zone = "UTC")
    @Transactional
    public void rolloverOverdueCommitments() {
        // Query potential overdue commitments
        LocalDate serverToday = LocalDate.now();
        List<Commitment> candidates = commitmentRepository.findOverduePendingCommitments(serverToday);

        int transitionedCount = 0;
        for (Commitment commitment : candidates) {
            User user = commitment.getUser();
            ZoneId userZone;
            try {
                userZone = (user.getTimezone() != null && !user.getTimezone().isBlank())
                        ? ZoneId.of(user.getTimezone())
                        : ZoneId.systemDefault();
            } catch (Exception e) {
                userZone = ZoneId.systemDefault();
            }

            LocalDate userCurrentDate = LocalDate.now(userZone);
            if (commitment.getCommitmentDate().isBefore(userCurrentDate)) {
                commitment.setStatus(CommitmentStatus.MISSED);
                transitionedCount++;
            }
        }

        if (transitionedCount > 0) {
            commitmentRepository.saveAll(candidates);
            log.info("Nocturnal Rollover Daemon: Transitioned {} stale PENDING commitments to MISSED.", transitionedCount);
        }
    }
}
