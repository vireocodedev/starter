package com.vireocode.vireo.offline;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;

class OfflineDataLifecycleServiceTest {

    private static final Instant NOW = Instant.parse("2026-08-30T00:00:00Z");

    @Test
    void safeDefaultRetainsOnlyFingerprintableMetadataAndPartitionsByOwner() {
        StarterOfflineProperties properties = new StarterOfflineProperties();
        OfflineSyncCommandDto command = new OfflineSyncCommandDto(
                UUID.randomUUID(), "POST", "/api/orders", null, Map.of("Idempotency-Key", "secret"));
        OfflineDataLifecycleDecision decision = new SafeDefaultOfflineDataLifecyclePolicy(properties).classify(
                new OfflineDataLifecycleContext(NOW, new OfflineActor(null, "demo", false), "tenant:a/user:demo",
                        command, "{\"secret\":true}", "{\"Idempotency-Key\":\"secret\"}"));

        assertEquals("tenant:a/user:demo", decision.partitionKey());
        assertEquals(NOW.plus(properties.getCommandRetention()), decision.retainUntil());
        assertNull(decision.requestBody());
        assertNull(decision.requestHeaders());
    }

    @Test
    void quotaRejectsAdmissionWhenOnlyLegallyHeldRowsRemain() {
        OfflineSyncCommandRepository repository = org.mockito.Mockito.mock(OfflineSyncCommandRepository.class);
        StarterOfflineProperties properties = new StarterOfflineProperties();
        properties.setMaxCommandsPerPartition(1);
        ApplicationEventPublisher events = org.mockito.Mockito.mock(ApplicationEventPublisher.class);
        OfflineDataLifecycleService service = service(repository, properties, events);
        OfflineSyncCommandEntity entry = entry("tenant:a");
        when(repository.countByLifecyclePartition("tenant:a")).thenReturn(1L);
        when(repository.findByLifecyclePartitionAndLegalHoldFalseOrderByCreatedAtAscIdAsc(
                org.mockito.ArgumentMatchers.eq("tenant:a"), org.mockito.ArgumentMatchers.any(Pageable.class)))
                .thenReturn(List.of());
        when(repository.countByLifecyclePartitionAndLegalHoldTrue("tenant:a")).thenReturn(1L);

        assertThrows(OfflineDataLifecycleException.class, () -> service.admit(entry));

        verify(repository, never()).deleteAllInBatch(org.mockito.ArgumentMatchers.anyList());
        verify(events).publishEvent(new OfflineDataLifecycleEvent(
                OfflineDataLifecycleEvent.Operation.QUOTA_REJECTED, 0, 1));
    }

    @Test
    void ownerErasureCannotCrossItsExplicitTenantPartition() {
        OfflineSyncCommandRepository repository = org.mockito.Mockito.mock(OfflineSyncCommandRepository.class);
        ApplicationEventPublisher events = org.mockito.Mockito.mock(ApplicationEventPublisher.class);
        OfflineDataLifecycleService service = service(repository, new StarterOfflineProperties(), events);
        when(repository.eraseOwner("tenant:a", "user:7")).thenReturn(2);
        when(repository.countByLifecyclePartitionAndOwnerKeyAndLegalHoldTrue("tenant:a", "user:7")).thenReturn(1L);

        assertEquals(2, service.eraseOwner("tenant:a", "user:7"));

        verify(repository).eraseOwner("tenant:a", "user:7");
        verify(repository, never()).eraseOwner("tenant:b", "user:7");
        verify(events).publishEvent(new OfflineDataLifecycleEvent(
                OfflineDataLifecycleEvent.Operation.ERASED, 2, 1));
    }

    @Test
    void legalHoldCannotCrossItsExplicitTenantPartition() {
        OfflineSyncCommandRepository repository = org.mockito.Mockito.mock(OfflineSyncCommandRepository.class);
        ApplicationEventPublisher events = org.mockito.Mockito.mock(ApplicationEventPublisher.class);
        OfflineDataLifecycleService service = service(repository, new StarterOfflineProperties(), events);
        UUID commandId = UUID.randomUUID();
        when(repository.setLegalHold("tenant:a", commandId, true)).thenReturn(1);

        assertEquals(true, service.setLegalHold("tenant:a", commandId, true));

        verify(repository).setLegalHold("tenant:a", commandId, true);
        verify(repository, never()).setLegalHold("tenant:b", commandId, true);
    }

    private OfflineDataLifecycleService service(OfflineSyncCommandRepository repository,
            StarterOfflineProperties properties, ApplicationEventPublisher events) {
        return new OfflineDataLifecycleService(repository, properties, Clock.fixed(NOW, ZoneOffset.UTC), events);
    }

    private OfflineSyncCommandEntity entry(String partition) {
        OfflineSyncCommandEntity entry = new OfflineSyncCommandEntity();
        entry.setLifecyclePartition(partition);
        entry.setCreatedAt(NOW);
        entry.setRetainUntil(NOW.plusSeconds(60));
        return entry;
    }
}
