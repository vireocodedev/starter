package com.vireocode.vireo.history;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.Test;

import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationHandler;
import io.micrometer.observation.ObservationRegistry;

class HistoryMicrometerObservationsTest {

    @Test
    void historyLifecycleTagsCannotContainPartitionActorEntityOrPayload() {
        AtomicReference<Observation.Context> stopped = new AtomicReference<>();
        ObservationRegistry registry = ObservationRegistry.create();
        registry.observationConfig().observationHandler(new ObservationHandler<>() {
            @Override
            public void onStop(Observation.Context context) {
                stopped.set(context);
            }

            @Override
            public boolean supportsContext(Observation.Context context) {
                return true;
            }
        });

        new HistoryMicrometerObservations(registry).onLifecycleEvent(
                new HistoryDataLifecycleEvent(HistoryDataLifecycleEvent.Operation.QUOTA_REJECTED, 0, 5));

        Observation.Context context = stopped.get();
        assertEquals("vireo.history.lifecycle", context.getName());
        assertEquals("quota_rejected", context.getLowCardinalityKeyValue("operation").getValue());
        assertNull(context.getLowCardinalityKeyValue("partition"));
        assertNull(context.getLowCardinalityKeyValue("actor"));
        assertNull(context.getLowCardinalityKeyValue("entity"));
        assertNull(context.getLowCardinalityKeyValue("payload"));
    }
}
