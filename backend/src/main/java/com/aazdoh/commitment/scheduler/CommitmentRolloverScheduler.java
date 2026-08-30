package com.aazdoh.commitment.scheduler;

import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.user.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Component
public class CommitmentRolloverScheduler {

    private static final Logger log = LoggerFactory.getLogger(CommitmentRolloverScheduler.class);

    private final CommitmentRepository commitmentRepository;

    public CommitmentRolloverScheduler(CommitmentRepository commitmentRepository) {
        this.commitmentRepository = commitmentRepository;
    }

    /**
     * Runs hourly to sweep and roll over stale PENDING commitments past their local day boundary.
     */
    @Scheduled(cron = "0 0 * * * *")
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
