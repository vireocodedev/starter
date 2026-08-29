package com.vireocode.vireo.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.concurrent.atomic.AtomicReference;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import com.vireocode.vireo.observability.QueryExecutionObservationEvent;

import io.micrometer.observation.Observation;
import io.micrometer.observation.ObservationHandler;
import io.micrometer.observation.ObservationRegistry;

class CoreMicrometerObservationsTest {

    @Test
    void structuredQueryEventHasNoFreeFormDimensions() {
        assertEquals(List.of("outcome", "searched", "filtered", "resultCount", "durationNanos"),
                Arrays.stream(QueryExecutionObservationEvent.class.getRecordComponents())
                        .map(java.lang.reflect.RecordComponent::getName)
                        .toList());
    }

    @Test
    void bridgeBacksOffWithoutRegistryAndActivatesWithOne() {
        ApplicationContextRunner runner = new ApplicationContextRunner()
                .withUserConfiguration(StarterCoreAutoConfiguration.StarterCoreObservabilityConfiguration.class);

        runner.run(context -> org.assertj.core.api.Assertions.assertThat(context)
                .doesNotHaveBean(CoreMicrometerObservations.class));
        runner.withBean(ObservationRegistry.class, ObservationRegistry::create)
                .run(context -> org.assertj.core.api.Assertions.assertThat(context)
                        .hasSingleBean(CoreMicrometerObservations.class));
    }

    @Test
    void queryTagsAreBoundedAndContainNoIdentityOrPayloadDimensions() {
        AtomicReference<Observation.Context> stopped = new AtomicReference<>();
        ObservationRegistry registry = registry(stopped);

        new CoreMicrometerObservations(registry).onQueryExecution(
                new QueryExecutionObservationEvent(
                        QueryExecutionObservationEvent.Outcome.SUCCESS, true, true, 7, 123));

        Observation.Context context = stopped.get();
        assertEquals("vireo.query.execution", context.getName());
        assertEquals("success", context.getLowCardinalityKeyValue("outcome").getValue());
        assertEquals("true", context.getLowCardinalityKeyValue("searched").getValue());
        assertEquals("true", context.getLowCardinalityKeyValue("filtered").getValue());
        assertNull(context.getLowCardinalityKeyValue("entity"));
        assertNull(context.getLowCardinalityKeyValue("actor"));
        assertNull(context.getLowCardinalityKeyValue("search_text"));
    }

    private ObservationRegistry registry(AtomicReference<Observation.Context> stopped) {
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
        return registry;
    }
}
