package com.aazdoh.commitment;

import com.aazdoh.commitment.dto.CommitmentResponse;
import com.aazdoh.commitment.dto.CreateCommitmentRequest;
import com.aazdoh.commitment.entity.Commitment;
import com.aazdoh.commitment.entity.CommitmentPriority;
import com.aazdoh.commitment.entity.CommitmentStatus;
import com.aazdoh.commitment.entity.CommitmentVisibility;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.commitment.service.CommitmentService;
import com.aazdoh.user.entity.AiPersona;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.entity.UserRole;
import com.aazdoh.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommitmentServiceTest {

    @Mock
    private CommitmentRepository commitmentRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private CommitmentService commitmentService;

    private User testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = new User("test@aazdoh.com", "hash", "Test User", "UTC", AiPersona.BALANCED, UserRole.USER);
        testUser.setId(userId);
    }

    @Test
    void testCreateCommitment() {
        CreateCommitmentRequest request = new CreateCommitmentRequest();
        request.setTitle("Complete Payment API");
        request.setEstimatedMinutes(120);
        request.setPriority(CommitmentPriority.HIGH);
        request.setCommitmentDate(LocalDate.now());
        request.setVisibility(CommitmentVisibility.SHARED_WITH_PARTNER);

        when(userService.findUserById(userId)).thenReturn(testUser);
        when(commitmentRepository.save(any(Commitment.class))).thenAnswer(invocation -> {
            Commitment c = invocation.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        CommitmentResponse response = commitmentService.createCommitment(userId, request);

        assertNotNull(response);
        assertEquals("Complete Payment API", response.getTitle());
        assertEquals(CommitmentStatus.PENDING, response.getStatus());
        assertEquals(120, response.getEstimatedMinutes());
        verify(commitmentRepository, times(1)).save(any(Commitment.class));
    }

    @Test
    void testCompleteCommitment() {
        UUID commitmentId = UUID.randomUUID();
        Commitment commitment = new Commitment();
        commitment.setId(commitmentId);
        commitment.setUser(testUser);
        commitment.setTitle("Study SQL");
        commitment.setStatus(CommitmentStatus.PENDING);

        when(commitmentRepository.findActiveByIdAndUserId(commitmentId, userId)).thenReturn(Optional.of(commitment));
        when(commitmentRepository.save(any(Commitment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CommitmentResponse response = commitmentService.completeCommitment(userId, commitmentId);

        assertNotNull(response);
        assertEquals(CommitmentStatus.COMPLETED, response.getStatus());
        assertNotNull(response.getCompletedAt());
    }
}
