package com.vireocode.starter.offline;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicBoolean;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.vireocode.starter.spi.OfflineChangeBroadcaster;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public class OfflineHeartbeatService implements OfflineChangeBroadcaster {

    private static final Logger log = LoggerFactory.getLogger(OfflineHeartbeatService.class);
    private static final long SSE_NO_TIMEOUT = 0L;
    private static final String HEARTBEAT_EVENT = "heartbeat";
    private static final String BATCH_EVENT = "batch";
    private static final String CREATE_EVENT = "create";
    private static final String UPDATE_EVENT = "update";
    private static final String DELETE_EVENT = "delete";

    private final ConcurrentLinkedQueue<SseEmitter> emitters = new ConcurrentLinkedQueue<>();
    private final AtomicBoolean syncInProgress = new AtomicBoolean(false);

    public SseEmitter createEmitter() {
        SseEmitter emitter = new SseEmitter(SSE_NO_TIMEOUT);
        emitters.add(emitter);

        final Runnable clearCallback = () -> emitters.remove(emitter);
        emitter.onCompletion(clearCallback);
        emitter.onTimeout(clearCallback);
        emitter.onError(error -> clearCallback.run());

        sendHeartbeatToEmitter(emitter);
        return emitter;
    }

    public OfflineHeartbeatPayload getCurrentHeartbeat() {
        return new OfflineHeartbeatPayload(Instant.now(), syncInProgress.get());
    }

    public void markSyncInProgress(boolean inProgress) {
        syncInProgress.set(inProgress);
    }

    @Override
    public void publishCreateEvent(String entity, Object payload, Long revision) {
        queueEntityChange(CREATE_EVENT, entity, payload, revision);
    }

    @Override
    public void publishUpdateEvent(String entity, Object payload, Long revision) {
        queueEntityChange(UPDATE_EVENT, entity, payload, revision);
    }

    @Override
    public void publishDeleteEvent(String entity, Object payload, Long revision) {
        queueEntityChange(DELETE_EVENT, entity, payload, revision);
    }

    @Scheduled(fixedRate = 1000)
    public void publishHeartbeat() {
        for (SseEmitter emitter : emitters) {
            sendHeartbeatToEmitter(emitter);
        }
    }

    public void flushBatch() {
        OfflineSseBatchContext context = OfflineSseBatchContextHolder.getContext();
        List<OfflineSseBatchItem> events = context.getEvents();
        if (events.isEmpty()) {
            OfflineSseBatchContextHolder.clear();
            return;
        }

        OfflineSseBatchEvent payload = new OfflineSseBatchEvent(context.getBatchId(), events);
        for (SseEmitter emitter : emitters) {
            sendEventToEmitter(emitter, BATCH_EVENT, payload);
        }

        OfflineSseBatchContextHolder.clear();
    }

    private void sendHeartbeatToEmitter(SseEmitter emitter) {
        sendEventToEmitter(emitter, HEARTBEAT_EVENT, getCurrentHeartbeat());
    }

    private void queueEntityChange(String action, String entity, Object payload, Long revision) {
        OfflineSseBatchContext context = OfflineSseBatchContextHolder.getContext();
        context.addEvent(new OfflineSseBatchItem(action, entity, payload, revision));

        if (context.isFlushScheduled()) {
            return;
        }

        context.setFlushScheduled(true);

        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            flushBatch();
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                flushBatch();
            }

            @Override
            public void afterCompletion(int status) {
                if (status != STATUS_COMMITTED) {
                    OfflineSseBatchContextHolder.clear();
                }
            }
        });
    }

    private void sendEventToEmitter(SseEmitter emitter, String eventName, Object payload) {
        try {
            emitter.send(SseEmitter.event()
                    .name(eventName)
                    .data(payload));
        } catch (AsyncRequestNotUsableException e) {
            log.debug("Offline heartbeat emitter is no longer usable.");
            emitters.remove(emitter);
        } catch (IOException e) {
            log.debug("Removing offline heartbeat emitter after send failure.", e);
            emitter.completeWithError(e);
            emitters.remove(emitter);
        }
    }
}
