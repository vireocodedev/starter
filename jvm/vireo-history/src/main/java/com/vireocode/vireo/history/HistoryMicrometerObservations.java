package com.vireocode.vireo.history;

import org.springframework.context.event.EventListener;

import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationRegistry;

/** Internal Micrometer bridge for identity- and payload-free lifecycle events. */
final class HistoryMicrometerObservations {

    private final ObservationRegistry registry;

    HistoryMicrometerObservations(ObservationRegistry registry) {
        this.registry = registry;
    }

    @EventListener
    public void onLifecycleEvent(HistoryDataLifecycleEvent event) {
        Observation.createNotStarted("vireo.history.lifecycle", registry)
                .lowCardinalityKeyValue("operation", event.operation().name().toLowerCase(java.util.Locale.ROOT))
                .observe(() -> {
                });
    }
}
