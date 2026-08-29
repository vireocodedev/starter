package com.vireocode.vireo.queryengine;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.concurrent.atomic.AtomicReference;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;

import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationHandler;
import io.micrometer.observation.ObservationRegistry;

class QueryEngineMicrometerObservationsTest {

    @Test
    void structuredRelationEventHasNoFreeFormDimensions() {
        assertEquals(List.of("outcome", "searched", "resultCount", "durationNanos"),
                Arrays.stream(QueryRelationOptionObservationEvent.class.getRecordComponents())
                        .map(java.lang.reflect.RecordComponent::getName)
                        .toList());
    }

    @Test
    void relationOptionTagsUseOnlyBoundedDimensions() {
        AtomicReference<Observation.Context> stopped = new AtomicReference<>();
        ObservationRegistry registry = ObservationRegistry.create();
        registry.observationConfig().observationHandler(handler(stopped));

        new QueryEngineMicrometerObservations(registry).onRelationOptions(
                new QueryRelationOptionObservationEvent(
                        QueryRelationOptionObservationEvent.Outcome.DENIED, true, 0, 99));

        Observation.Context context = stopped.get();
        assertEquals("vireo.query.relation.options", context.getName());
        assertEquals("denied", context.getLowCardinalityKeyValue("outcome").getValue());
        assertEquals("true", context.getLowCardinalityKeyValue("searched").getValue());
        assertNull(context.getLowCardinalityKeyValue("entity"));
        assertNull(context.getLowCardinalityKeyValue("field"));
        assertNull(context.getLowCardinalityKeyValue("search_text"));
    }

    private ObservationHandler<Observation.Context> handler(AtomicReference<Observation.Context> stopped) {
        return new ObservationHandler<>() {
            @Override
            public void onStop(Observation.Context context) {
                stopped.set(context);
            }

            @Override
            public boolean supportsContext(Observation.Context context) {
                return true;
            }
        };
    }
}
