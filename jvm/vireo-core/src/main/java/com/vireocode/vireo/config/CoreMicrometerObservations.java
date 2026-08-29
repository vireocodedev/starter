package com.vireocode.vireo.config;

import org.springframework.context.event.EventListener;

import com.vireocode.vireo.observability.QueryExecutionObservationEvent;

import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationRegistry;

/** Internal bridge from safe Vireo events to backend-neutral observations. */
final class CoreMicrometerObservations {

    private final ObservationRegistry registry;

    CoreMicrometerObservations(ObservationRegistry registry) {
        this.registry = registry;
    }

    @EventListener
    public void onQueryExecution(QueryExecutionObservationEvent event) {
        Observation.createNotStarted("vireo.query.execution", registry)
                .lowCardinalityKeyValue("outcome", event.outcome().name().toLowerCase(java.util.Locale.ROOT))
                .lowCardinalityKeyValue("searched", Boolean.toString(event.searched()))
                .lowCardinalityKeyValue("filtered", Boolean.toString(event.filtered()))
                .observe(() -> {
                });
    }
}
