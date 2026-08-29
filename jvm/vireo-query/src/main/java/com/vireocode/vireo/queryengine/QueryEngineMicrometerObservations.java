package com.vireocode.vireo.queryengine;

import org.springframework.context.event.EventListener;

import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationRegistry;

/** Internal Micrometer bridge for safe Query Engine events. */
final class QueryEngineMicrometerObservations {

    private final ObservationRegistry registry;

    QueryEngineMicrometerObservations(ObservationRegistry registry) {
        this.registry = registry;
    }

    @EventListener
    public void onRelationOptions(QueryRelationOptionObservationEvent event) {
        Observation.createNotStarted("vireo.query.relation.options", registry)
                .lowCardinalityKeyValue("outcome", event.outcome().name().toLowerCase(java.util.Locale.ROOT))
                .lowCardinalityKeyValue("searched", Boolean.toString(event.searched()))
                .observe(() -> {
                });
    }
}
