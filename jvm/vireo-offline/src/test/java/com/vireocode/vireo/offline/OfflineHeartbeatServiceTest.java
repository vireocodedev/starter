package com.vireocode.vireo.offline;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

class OfflineHeartbeatServiceTest {

    @Test
    void createEmitterAndMarkSyncInProgress_WorkAsExpected() {
        OfflineHeartbeatService service = serviceFor("account-a");

        SseEmitter emitter = service.createEmitter();
        assertNotNull(emitter);

        assertFalse(service.getCurrentHeartbeat().syncInProgress());
        service.beginSync();
        assertTrue(service.getCurrentHeartbeat().syncInProgress());
        service.beginSync();
        service.endSync();
        assertTrue(service.getCurrentHeartbeat().syncInProgress());
        service.endSync();
        assertFalse(service.getCurrentHeartbeat().syncInProgress());
    }

    @Test
    void flushBatch_ClearsThreadLocalContextWhenNoEvents() {
        OfflineHeartbeatService service = serviceFor("account-a");

        OfflineSseBatchContext context = OfflineSseBatchContextHolder.getContext();
        context.setFlushScheduled(true);

        service.flushBatch();

        OfflineSseBatchContext after = OfflineSseBatchContextHolder.getContext();
        assertTrue(after.getEvents().isEmpty());
        assertFalse(after.isFlushScheduled());
    }

    @Test
    void publishEvent_WithoutTransaction_FlushesImmediatelyAndClearsContext() {
        OfflineHeartbeatService service = serviceFor("account-a");

        service.publishCreateEvent("Product", java.util.Map.of("id", 1), 3L);

        OfflineSseBatchContext after = OfflineSseBatchContextHolder.getContext();
        assertTrue(after.getEvents().isEmpty());
        assertFalse(after.isFlushScheduled());
    }

    @Test
    void publishEvent_WithTransaction_SchedulesFlushAndClearsOnRollback() {
        OfflineHeartbeatService service = serviceFor("account-a");

        try {
            TransactionSynchronizationManager.setActualTransactionActive(true);
            TransactionSynchronizationManager.initSynchronization();

            service.publishUpdateEvent("Order", java.util.Map.of("id", 10), 7L);
            service.publishDeleteEvent("Order", java.util.Map.of("id", 11), 8L);

            List<TransactionSynchronization> synchronizations = TransactionSynchronizationManager.getSynchronizations();
            assertFalse(synchronizations.isEmpty());

            OfflineSseBatchContext beforeCompletion = OfflineSseBatchContextHolder.getContext();
            assertTrue(beforeCompletion.isFlushScheduled());
            assertTrue(beforeCompletion.getEvents().size() >= 2);

            synchronizations.get(0).afterCompletion(TransactionSynchronization.STATUS_ROLLED_BACK);

            OfflineSseBatchContext after = OfflineSseBatchContextHolder.getContext();
            assertTrue(after.getEvents().isEmpty());
            assertFalse(after.isFlushScheduled());
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
            TransactionSynchronizationManager.setActualTransactionActive(false);
        }
    }

    @Test
    void publishEvent_WithTransaction_FlushesOnCommit() {
        OfflineHeartbeatService service = serviceFor("account-a");

        try {
            TransactionSynchronizationManager.setActualTransactionActive(true);
            TransactionSynchronizationManager.initSynchronization();

            service.publishCreateEvent("Widget", java.util.Map.of("id", 12), 9L);

            List<TransactionSynchronization> synchronizations = TransactionSynchronizationManager.getSynchronizations();
            assertFalse(synchronizations.isEmpty());

            synchronizations.get(0).afterCommit();

            OfflineSseBatchContext after = OfflineSseBatchContextHolder.getContext();
            assertTrue(after.getEvents().isEmpty());
            assertFalse(after.isFlushScheduled());
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
            TransactionSynchronizationManager.setActualTransactionActive(false);
        }
    }

    @Test
    void payloadEvents_AreDeliveredOnlyToTheResolvedAudience() {
        AtomicReference<String> currentAudience = new AtomicReference<>("account-a");
        OfflineHeartbeatService service = new OfflineHeartbeatService(
                Clock.systemUTC(), () -> Optional.ofNullable(currentAudience.get()));
        RecordingEmitter accountA = new RecordingEmitter();
        RecordingEmitter accountB = new RecordingEmitter();

        service.createEmitter(accountA);
        currentAudience.set("account-b");
        service.createEmitter(accountB);
        assertTrue(accountA.sentEvents == 1);
        assertTrue(accountB.sentEvents == 1);

        currentAudience.set("account-a");
        service.publishCreateEvent("Order", java.util.Map.of("id", 42), 10L);

        assertTrue(accountA.sentEvents == 2);
        assertTrue(accountB.sentEvents == 1);
    }

    @Test
    void missingAudienceResolver_DeniesStreamsAndDiscardsPayloads() {
        OfflineHeartbeatService service = new OfflineHeartbeatService();

        assertThrows(AccessDeniedException.class, service::createEmitter);
        service.publishCreateEvent("Order", java.util.Map.of("id", 42), 10L);

        OfflineSseBatchContext context = OfflineSseBatchContextHolder.getContext();
        assertTrue(context.getEvents().isEmpty());
        assertFalse(context.isFlushScheduled());
    }

    @Test
    void oneTransaction_CannotMixPayloadAudiences() {
        AtomicReference<String> currentAudience = new AtomicReference<>("account-a");
        OfflineHeartbeatService service = new OfflineHeartbeatService(
                Clock.systemUTC(), () -> Optional.of(currentAudience.get()));

        try {
            TransactionSynchronizationManager.setActualTransactionActive(true);
            TransactionSynchronizationManager.initSynchronization();
            service.publishCreateEvent("Order", java.util.Map.of("id", 1), 1L);
            currentAudience.set("account-b");

            assertThrows(IllegalStateException.class,
                    () -> service.publishUpdateEvent("Order", java.util.Map.of("id", 1), 2L));
        } finally {
            OfflineSseBatchContextHolder.clear();
            TransactionSynchronizationManager.clearSynchronization();
            TransactionSynchronizationManager.setActualTransactionActive(false);
        }
    }

    private static OfflineHeartbeatService serviceFor(String audience) {
        return new OfflineHeartbeatService(Clock.systemUTC(), () -> Optional.of(audience));
    }

    private static final class RecordingEmitter extends SseEmitter {
        private int sentEvents;

        @Override
        public void send(SseEventBuilder builder) {
            sentEvents++;
        }
    }
}
