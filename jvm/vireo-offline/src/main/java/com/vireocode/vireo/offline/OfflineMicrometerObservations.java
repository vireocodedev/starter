package com.vireocode.vireo.offline;

import org.springframework.context.event.EventListener;

import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationRegistry;

/** Internal Micrometer bridge for safe Offline events. */
final class OfflineMicrometerObservations {

    private final ObservationRegistry registry;

    OfflineMicrometerObservations(ObservationRegistry registry) {
        this.registry = registry;
    }

    @EventListener
    public void onOperationalEvent(OfflineObservationEvent event) {
        String name = switch (event.operation()) {
            case BATCH -> "vireo.offline.batch";
            case REPLAY -> "vireo.offline.replay";
            case QUEUE -> "vireo.offline.queue";
            case SSE_CONNECT, SSE_HEARTBEAT, SSE_BATCH, SSE_CHANGE -> "vireo.offline.sse";
        };
        Observation.createNotStarted(name, registry)
                .lowCardinalityKeyValue("operation", tag(event.operation()))
                .lowCardinalityKeyValue("outcome", tag(event.outcome()))
                .observe(() -> {
                });
    }

    @EventListener
    public void onLifecycleEvent(OfflineDataLifecycleEvent event) {
        Observation.createNotStarted("vireo.offline.lifecycle", registry)
                .lowCardinalityKeyValue("operation", tag(event.operation()))
                .observe(() -> {
                });
    }

    private String tag(Enum<?> value) {
        return value.name().toLowerCase(java.util.Locale.ROOT);
    }
}
