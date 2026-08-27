package com.vireocode.vireo.offline;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

class OfflineHeartbeatServiceTest {

    @Test
    void createEmitterAndMarkSyncInProgress_WorkAsExpected() {
        OfflineHeartbeatService service = new OfflineHeartbeatService();

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
        OfflineHeartbeatService service = new OfflineHeartbeatService();

        OfflineSseBatchContext context = OfflineSseBatchContextHolder.getContext();
        context.setFlushScheduled(true);

        service.flushBatch();

        OfflineSseBatchContext after = OfflineSseBatchContextHolder.getContext();
        assertTrue(after.getEvents().isEmpty());
        assertFalse(after.isFlushScheduled());
    }

    @Test
    void publishEvent_WithoutTransaction_FlushesImmediatelyAndClearsContext() {
        OfflineHeartbeatService service = new OfflineHeartbeatService();

        service.publishCreateEvent("Product", java.util.Map.of("id", 1), 3L);

        OfflineSseBatchContext after = OfflineSseBatchContextHolder.getContext();
        assertTrue(after.getEvents().isEmpty());
        assertFalse(after.isFlushScheduled());
    }

    @Test
    void publishEvent_WithTransaction_SchedulesFlushAndClearsOnRollback() {
        OfflineHeartbeatService service = new OfflineHeartbeatService();

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
        OfflineHeartbeatService service = new OfflineHeartbeatService();

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
}
