package com.vireocode.vireo.history;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;

import tools.jackson.databind.node.JsonNodeFactory;

class HistoryDataLifecycleServiceTest {

    private static final Instant NOW = Instant.parse("2026-08-30T00:00:00Z");

    @Test
    void safeDefaultRedactsSnapshotsAndPartitionsByActor() {
        StarterHistoryProperties properties = new StarterHistoryProperties();
        HistoryDataLifecycleDecision decision = new SafeDefaultHistoryDataLifecyclePolicy(properties).classify(
                new HistoryDataLifecycleContext(NOW, new HistoryActor("user-7", "User"), "ORDER", "42",
                        JsonNodeFactory.instance.objectNode().put("secret", "before"),
                        JsonNodeFactory.instance.objectNode().put("secret", "after")));

        assertEquals("actor:user-7", decision.partitionKey());
        assertEquals(NOW.plus(properties.getRetention()), decision.retainUntil());
        assertEquals(0, decision.snapshotPrevious().size());
        assertEquals(0, decision.snapshotCurrent().size());
    }

    @Test
    void quotaFailsClosedWhenLegalHoldsConsumeThePartition() {
        HistoryRepository repository = org.mockito.Mockito.mock(HistoryRepository.class);
        StarterHistoryProperties properties = new StarterHistoryProperties();
        properties.setMaxRecordsPerPartition(1);
        ApplicationEventPublisher events = org.mockito.Mockito.mock(ApplicationEventPublisher.class);
        HistoryDataLifecycleService service = service(repository, properties, events);
        HistoryEntry entry = entry("tenant:a");
        when(repository.countByLifecyclePartition("tenant:a")).thenReturn(1L);
        when(repository.findByLifecyclePartitionAndLegalHoldFalseOrderByOccurredAtAscIdAsc(
                org.mockito.ArgumentMatchers.eq("tenant:a"), org.mockito.ArgumentMatchers.any(Pageable.class)))
                .thenReturn(List.of());
        when(repository.countByLifecyclePartitionAndLegalHoldTrue("tenant:a")).thenReturn(1L);

        assertThrows(HistoryDataLifecycleException.class, () -> service.store(entry));

        verify(repository, never()).save(entry);
        verify(events).publishEvent(new HistoryDataLifecycleEvent(
                HistoryDataLifecycleEvent.Operation.QUOTA_REJECTED, 0, 1));
    }

    @Test
    void erasureIsBoundToBothPartitionAndActorAndReportsHeldRows() {
        HistoryRepository repository = org.mockito.Mockito.mock(HistoryRepository.class);
        ApplicationEventPublisher events = org.mockito.Mockito.mock(ApplicationEventPublisher.class);
        HistoryDataLifecycleService service = service(repository, new StarterHistoryProperties(), events);
        when(repository.eraseActor("tenant:a", "user-7")).thenReturn(3);
        when(repository.countByLifecyclePartitionAndActorIdAndLegalHoldTrue("tenant:a", "user-7")).thenReturn(1L);

        assertEquals(3, service.eraseActor("tenant:a", "user-7"));

        verify(repository).eraseActor("tenant:a", "user-7");
        verify(repository, never()).eraseActor("tenant:b", "user-7");
        verify(events).publishEvent(new HistoryDataLifecycleEvent(
                HistoryDataLifecycleEvent.Operation.ERASED, 3, 1));
    }

    @Test
    void legalHoldCannotCrossItsExplicitPartition() {
        HistoryRepository repository = org.mockito.Mockito.mock(HistoryRepository.class);
        ApplicationEventPublisher events = org.mockito.Mockito.mock(ApplicationEventPublisher.class);
        HistoryDataLifecycleService service = service(repository, new StarterHistoryProperties(), events);
        UUID recordId = UUID.randomUUID();
        when(repository.setLegalHold("tenant:a", recordId, true)).thenReturn(1);

        assertEquals(true, service.setLegalHold("tenant:a", recordId, true));

        verify(repository).setLegalHold("tenant:a", recordId, true);
        verify(repository, never()).setLegalHold("tenant:b", recordId, true);
    }

    private HistoryDataLifecycleService service(HistoryRepository repository, StarterHistoryProperties properties,
            ApplicationEventPublisher events) {
        return new HistoryDataLifecycleService(repository, properties, Clock.fixed(NOW, ZoneOffset.UTC), events);
    }

    private HistoryEntry entry(String partition) {
        HistoryEntry entry = new HistoryEntry();
        entry.setLifecyclePartition(partition);
        entry.setOccurredAt(NOW);
        entry.setRetainUntil(NOW.plusSeconds(60));
        return entry;
    }
}
