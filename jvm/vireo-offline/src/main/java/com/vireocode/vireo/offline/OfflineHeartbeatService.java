package com.vireocode.vireo.offline;

import java.io.IOException;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicInteger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.context.ApplicationEventPublisher;

import com.vireocode.vireo.spi.OfflineChangeBroadcaster;

public class OfflineHeartbeatService implements OfflineChangeBroadcaster {

    private static final Logger log = LoggerFactory.getLogger(OfflineHeartbeatService.class);
    private static final long SSE_NO_TIMEOUT = 0L;
    private static final String HEARTBEAT_EVENT = "heartbeat";
    private static final String BATCH_EVENT = "batch";
    private static final String CREATE_EVENT = "create";
    private static final String UPDATE_EVENT = "update";
    private static final String DELETE_EVENT = "delete";

    private final ConcurrentLinkedQueue<AudienceEmitter> emitters = new ConcurrentLinkedQueue<>();
    private final AtomicInteger activeSyncs = new AtomicInteger();
    private final Clock clock;
    private final OfflineSseAudienceResolver audienceResolver;
    private final ApplicationEventPublisher observationEvents;

    public OfflineHeartbeatService() {
        this(Clock.systemUTC(), new DenyAllOfflineSseAudienceResolver());
    }

    OfflineHeartbeatService(Clock clock) {
        this(clock, new DenyAllOfflineSseAudienceResolver());
    }

    OfflineHeartbeatService(Clock clock, OfflineSseAudienceResolver audienceResolver) {
        this(clock, audienceResolver, event -> {
        });
    }

    OfflineHeartbeatService(Clock clock, OfflineSseAudienceResolver audienceResolver,
            ApplicationEventPublisher observationEvents) {
        this.clock = Objects.requireNonNull(clock, "clock");
        this.audienceResolver = Objects.requireNonNull(audienceResolver, "audienceResolver");
        this.observationEvents = Objects.requireNonNull(observationEvents, "observationEvents");
    }

    public SseEmitter createEmitter() {
        return createEmitter(new SseEmitter(SSE_NO_TIMEOUT));
    }

    SseEmitter createEmitter(SseEmitter emitter) {
        String audience = requireCurrentAudience();
        AudienceEmitter audienceEmitter = new AudienceEmitter(audience, emitter);
        emitters.add(audienceEmitter);
        publishObservation(new OfflineObservationEvent(
                OfflineObservationEvent.Operation.SSE_CONNECT, OfflineObservationEvent.Outcome.CONNECTED, 1, 0));

        emitter.onCompletion(() -> removeEmitter(audienceEmitter, OfflineObservationEvent.Outcome.DISCONNECTED));
        emitter.onTimeout(() -> removeEmitter(audienceEmitter, OfflineObservationEvent.Outcome.DISCONNECTED));
        emitter.onError(error -> removeEmitter(audienceEmitter, OfflineObservationEvent.Outcome.ERROR));

        sendHeartbeatToEmitter(audienceEmitter);
        return emitter;
    }

    public OfflineHeartbeatPayload getCurrentHeartbeat() {
        return new OfflineHeartbeatPayload(Instant.now(clock), activeSyncs.get() > 0);
    }

    void beginSync() {
        activeSyncs.incrementAndGet();
    }

    void endSync() {
        activeSyncs.updateAndGet(current -> Math.max(0, current - 1));
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

    @Scheduled(fixedRateString = "${vireo.starter.offline.heartbeat-interval:PT1S}")
    public void publishHeartbeat() {
        for (AudienceEmitter audienceEmitter : emitters) {
            sendHeartbeatToEmitter(audienceEmitter);
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
        for (AudienceEmitter audienceEmitter : emitters) {
            if (audienceEmitter.audience().equals(context.getAudience())) {
                sendEventToEmitter(audienceEmitter, BATCH_EVENT, payload);
            }
        }

        OfflineSseBatchContextHolder.clear();
    }

    private void sendHeartbeatToEmitter(AudienceEmitter audienceEmitter) {
        sendEventToEmitter(audienceEmitter, HEARTBEAT_EVENT, getCurrentHeartbeat(), 1);
    }

    private void queueEntityChange(String action, String entity, Object payload, Long revision) {
        String audience = audienceResolver.resolveCurrentAudience()
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .orElse(null);
        if (audience == null) {
            log.debug("Discarding offline SSE payload because no application audience was resolved.");
            publishObservation(new OfflineObservationEvent(
                    OfflineObservationEvent.Operation.SSE_CHANGE, OfflineObservationEvent.Outcome.DISCARDED, 1, 0));
            return;
        }
        OfflineSseBatchContext context = OfflineSseBatchContextHolder.getContext();
        context.addEvent(audience, new OfflineSseBatchItem(action, entity, payload, revision));
        publishObservation(new OfflineObservationEvent(
                OfflineObservationEvent.Operation.SSE_CHANGE, OfflineObservationEvent.Outcome.ADMITTED, 1, 0));

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

    private String requireCurrentAudience() {
        return audienceResolver.resolveCurrentAudience()
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .orElseThrow(() -> new AccessDeniedException(
                        "Offline SSE streaming requires an application OfflineSseAudienceResolver"));
    }

    private void sendEventToEmitter(AudienceEmitter audienceEmitter, String eventName, Object payload) {
        long itemCount = payload instanceof OfflineSseBatchEvent batch ? batch.events().size() : 1;
        sendEventToEmitter(audienceEmitter, eventName, payload, itemCount);
    }

    private void sendEventToEmitter(AudienceEmitter audienceEmitter, String eventName, Object payload,
            long itemCount) {
        SseEmitter emitter = audienceEmitter.emitter();
        long startedAt = System.nanoTime();
        try {
            emitter.send(SseEmitter.event()
                    .name(eventName)
                    .data(payload));
            publishObservation(new OfflineObservationEvent(
                    sseOperation(eventName), OfflineObservationEvent.Outcome.DELIVERED, itemCount,
                    System.nanoTime() - startedAt));
        } catch (AsyncRequestNotUsableException e) {
            log.debug("Offline heartbeat emitter is no longer usable.");
            emitters.remove(audienceEmitter);
            publishObservation(new OfflineObservationEvent(
                    sseOperation(eventName), OfflineObservationEvent.Outcome.DISCONNECTED, itemCount,
                    System.nanoTime() - startedAt));
        } catch (IOException e) {
            log.debug("Removing offline heartbeat emitter after send failure.", e);
            emitter.completeWithError(e);
            emitters.remove(audienceEmitter);
            publishObservation(new OfflineObservationEvent(
                    sseOperation(eventName), OfflineObservationEvent.Outcome.ERROR, itemCount,
                    System.nanoTime() - startedAt));
        }
    }

    private OfflineObservationEvent.Operation sseOperation(String eventName) {
        return BATCH_EVENT.equals(eventName)
                ? OfflineObservationEvent.Operation.SSE_BATCH
                : OfflineObservationEvent.Operation.SSE_HEARTBEAT;
    }

    private void removeEmitter(AudienceEmitter audienceEmitter, OfflineObservationEvent.Outcome outcome) {
        if (emitters.remove(audienceEmitter)) {
            publishObservation(new OfflineObservationEvent(
                    OfflineObservationEvent.Operation.SSE_CONNECT, outcome, 1, 0));
        }
    }

    private void publishObservation(OfflineObservationEvent event) {
        try {
            observationEvents.publishEvent(event);
        } catch (RuntimeException exception) {
            log.debug("Offline SSE observation listener failed; delivery remains authoritative.", exception);
        }
    }

    private record AudienceEmitter(String audience, SseEmitter emitter) {
    }
}
