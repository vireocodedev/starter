package com.vireocode.vireo.offline;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.concurrent.atomic.AtomicReference;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;

import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationHandler;
import io.micrometer.observation.ObservationRegistry;

class OfflineMicrometerObservationsTest {

    @Test
    void structuredOfflineEventHasNoFreeFormDimensions() {
        assertEquals(List.of("operation", "outcome", "itemCount", "durationNanos"),
                Arrays.stream(OfflineObservationEvent.class.getRecordComponents())
                        .map(java.lang.reflect.RecordComponent::getName)
                        .toList());
    }

    @Test
    void replayTagsCannotContainCommandOwnerUrlOrPayload() {
        AtomicReference<Observation.Context> stopped = new AtomicReference<>();
        ObservationRegistry registry = ObservationRegistry.create();
        registry.observationConfig().observationHandler(handler(stopped));

        new OfflineMicrometerObservations(registry).onOperationalEvent(new OfflineObservationEvent(
                OfflineObservationEvent.Operation.REPLAY, OfflineObservationEvent.Outcome.CONFLICT, 1, 88));

        Observation.Context context = stopped.get();
        assertEquals("vireo.offline.replay", context.getName());
        assertEquals("replay", context.getLowCardinalityKeyValue("operation").getValue());
        assertEquals("conflict", context.getLowCardinalityKeyValue("outcome").getValue());
        assertNull(context.getLowCardinalityKeyValue("command_id"));
        assertNull(context.getLowCardinalityKeyValue("owner"));
        assertNull(context.getLowCardinalityKeyValue("url"));
        assertNull(context.getLowCardinalityKeyValue("payload"));
    }

    @Test
    void offlineLifecycleUsesOnlyItsBoundedOperation() {
        AtomicReference<Observation.Context> stopped = new AtomicReference<>();
        ObservationRegistry registry = ObservationRegistry.create();
        registry.observationConfig().observationHandler(handler(stopped));

        new OfflineMicrometerObservations(registry).onLifecycleEvent(
                new OfflineDataLifecycleEvent(OfflineDataLifecycleEvent.Operation.ERASED, 2, 1));

        Observation.Context context = stopped.get();
        assertEquals("vireo.offline.lifecycle", context.getName());
        assertEquals("erased", context.getLowCardinalityKeyValue("operation").getValue());
        assertNull(context.getLowCardinalityKeyValue("partition"));
        assertNull(context.getLowCardinalityKeyValue("owner"));
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
