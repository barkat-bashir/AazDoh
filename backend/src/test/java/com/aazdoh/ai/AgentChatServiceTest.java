package com.aazdoh.ai;

import com.aazdoh.ai.agent.AgentTools;
import com.aazdoh.ai.repository.AgentActionLogRepository;
import com.aazdoh.ai.service.AgentChatService;
import com.aazdoh.analytics.service.UserExecutionStatsService;
import com.aazdoh.commitment.repository.CommitmentRepository;
import com.aazdoh.commitment.service.CommitmentService;
import com.aazdoh.user.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.concurrent.Executors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

@ExtendWith(MockitoExtension.class)
class AgentChatServiceTest {

    @Mock
    private ChatClient chatClient;
    @Mock
    private AgentTools agentTools;
    @Mock
    private AgentActionLogRepository actionLogRepository;
    @Mock
    private CommitmentRepository commitmentRepository;
    @Mock
    private CommitmentService commitmentService;
    @Mock
    private UserService userService;
    @Mock
    private UserExecutionStatsService statsService;

    private AgentChatService agentChatService;
    private final LocalDate anchorDate = LocalDate.of(2026, 10, 1); // Thursday

    @BeforeEach
    void setUp() {
        agentChatService = new AgentChatService(
                chatClient,
                agentTools,
                actionLogRepository,
                commitmentRepository,
                commitmentService,
                userService,
                statsService,
                new ObjectMapper(),
                Executors.newSingleThreadExecutor()
        );
    }

    @Test
    void testParseDateRelativeKeywords() {
        assertEquals(anchorDate, agentChatService.parseDate("today", anchorDate));
        assertEquals(anchorDate.plusDays(1), agentChatService.parseDate("tomorrow", anchorDate));
        assertEquals(anchorDate.minusDays(1), agentChatService.parseDate("yesterday", anchorDate));
        assertEquals(anchorDate.plusDays(2), agentChatService.parseDate("day after tomorrow", anchorDate));
        assertEquals(anchorDate.minusDays(2), agentChatService.parseDate("day before yesterday", anchorDate));
    }

    @Test
    void testParseDateOffsets() {
        assertEquals(anchorDate.plusDays(3), agentChatService.parseDate("in 3 days", anchorDate));
        assertEquals(anchorDate.minusDays(4), agentChatService.parseDate("4 days ago", anchorDate));
        assertEquals(anchorDate.plusDays(2), agentChatService.parseDate("+2d", anchorDate));
        assertEquals(anchorDate.minusDays(1), agentChatService.parseDate("-1d", anchorDate));
    }

    @Test
    void testParseDateWeekdays() {
        LocalDate expectedNextMonday = anchorDate.with(TemporalAdjusters.next(DayOfWeek.MONDAY));
        assertEquals(expectedNextMonday, agentChatService.parseDate("next monday", anchorDate));

        LocalDate expectedFriday = anchorDate.with(TemporalAdjusters.nextOrSame(DayOfWeek.FRIDAY));
        assertEquals(expectedFriday, agentChatService.parseDate("this friday", anchorDate));

        LocalDate expectedLastTuesday = anchorDate.with(TemporalAdjusters.previous(DayOfWeek.TUESDAY));
        assertEquals(expectedLastTuesday, agentChatService.parseDate("last tuesday", anchorDate));
    }

    @Test
    void testParseDateIsoFormat() {
        assertEquals(LocalDate.of(2026, 10, 15), agentChatService.parseDate("2026-10-15", anchorDate));
        assertEquals(LocalDate.of(2026, 11, 20), agentChatService.parseDate("2026/11/20", anchorDate));
        assertNull(agentChatService.parseDate("invalid-date", anchorDate));
        assertNull(agentChatService.parseDate(null, anchorDate));
    }
}
