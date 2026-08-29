package com.vireocode.vireo.history;

import java.time.Clock;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.ApplicationEventPublisher;

import com.vireocode.vireo.spi.HistoryEventsRecorder;
import com.vireocode.vireo.flyway.StarterFlywayModule;

import tools.jackson.databind.ObjectMapper;

/**
 * Wires audit history from the dependency alone.
 *
 * <p>
 * {@code BaseService} records history through core's
 * {@link HistoryEventsRecorder} interface, so a consumer who wants history
 * written somewhere other than the {@code history} table replaces that bean and
 * keeps everything else.
 */
@AutoConfiguration
@EnableConfigurationProperties(StarterHistoryProperties.class)
public class StarterHistoryAutoConfiguration {

    /** Optional Micrometer bridge for the existing safe lifecycle events. */
    @Configuration(proxyBeanMethods = false)
    @ConditionalOnClass(name = "io.micrometer.observation.ObservationRegistry")
    @ConditionalOnBean(type = "io.micrometer.observation.ObservationRegistry")
    static class StarterHistoryObservabilityConfiguration {

        @Bean
        @ConditionalOnMissingBean(name = "starterHistoryMicrometerObservations")
        HistoryMicrometerObservations starterHistoryMicrometerObservations(
                io.micrometer.observation.ObservationRegistry registry) {
            return new HistoryMicrometerObservations(registry);
        }
    }

    @Bean
    StarterFlywayModule historyFlywayModule() {
        return new StarterFlywayModule("history", 20);
    }

    @Bean
    @ConditionalOnMissingBean(HistoryEventsRecorder.class)
    HistoryRecorder starterHistoryRecorder(HistoryRepository repository, ObjectMapper objectMapper,
            HistoryActorResolver actorResolver, Clock clock, HistoryDataLifecyclePolicy lifecyclePolicy,
            HistoryDataLifecycleService lifecycleService) {
        return new HistoryRecorder(repository, objectMapper, actorResolver, clock, lifecyclePolicy, lifecycleService);
    }

    @Bean
    @ConditionalOnMissingBean
    HistoryDataLifecyclePolicy starterHistoryDataLifecyclePolicy(StarterHistoryProperties properties) {
        return new SafeDefaultHistoryDataLifecyclePolicy(properties);
    }

    @Bean
    @ConditionalOnMissingBean
    HistoryDataLifecycleService starterHistoryDataLifecycleService(HistoryRepository repository,
            StarterHistoryProperties properties, Clock clock, ApplicationEventPublisher events) {
        return new HistoryDataLifecycleService(repository, properties, clock, events);
    }

    @Bean
    @ConditionalOnMissingBean
    HistoryActorResolver starterHistoryActorResolver() {
        return new SecurityContextHistoryActorResolver();
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnBean(HistoryReadAuthorizer.class)
    @ConditionalOnProperty(prefix = "vireo.starter.history", name = "endpoint-enabled", matchIfMissing = true)
    HistoryController starterHistoryController(HistoryRepository repository, ObjectMapper objectMapper,
            StarterHistoryProperties properties) {
        return new HistoryController(repository, objectMapper, properties);
    }
}
