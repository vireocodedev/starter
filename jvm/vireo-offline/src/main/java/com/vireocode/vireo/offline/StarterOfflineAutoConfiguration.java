package com.vireocode.vireo.offline;

import java.util.List;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.PlatformTransactionManager;

import java.time.Clock;

import com.vireocode.vireo.flyway.StarterFlywayModule;
import com.vireocode.vireo.queryengine.QueryEngineFilterSpecificationBuilder;
import com.vireocode.vireo.spi.OfflineChangeBroadcaster;
import com.vireocode.vireo.spi.OfflineRevisionTracker;

import tools.jackson.databind.ObjectMapper;

/**
 * Wires the offline sync stack from the dependency alone.
 *
 * <p>
 * Two of these beans are the implementations behind core's service-provider
 * interfaces, and they are conditional on the interface rather than on the
 * concrete class. A consumer who broadcasts changes over a message broker
 * instead of server-sent events replaces {@link OfflineChangeBroadcaster} and
 * {@code BaseService} picks it up without knowing the difference.
 */
@AutoConfiguration
@EnableConfigurationProperties(StarterOfflineProperties.class)
public class StarterOfflineAutoConfiguration {

    /** Optional backend-neutral observation bridge. */
    @Configuration(proxyBeanMethods = false)
    @ConditionalOnClass(name = "io.micrometer.observation.ObservationRegistry")
    @ConditionalOnBean(type = "io.micrometer.observation.ObservationRegistry")
    static class StarterOfflineObservabilityConfiguration {

        @Bean
        @ConditionalOnMissingBean(name = "starterOfflineMicrometerObservations")
        OfflineMicrometerObservations starterOfflineMicrometerObservations(
                io.micrometer.observation.ObservationRegistry registry) {
            return new OfflineMicrometerObservations(registry);
        }
    }

    @Bean
    StarterFlywayModule offlineFlywayModule() {
        return new StarterFlywayModule("offline", 20);
    }

    /**
     * Keyed on its own type for the same reason as the heartbeat service: it is
     * the {@link OfflineRevisionTracker} implementation, but the hydration
     * controller depends on the concrete class.
     */
    @Bean
    @ConditionalOnMissingBean
    OfflineEntityVersionService starterOfflineEntityVersionService(OfflineEntityVersionRepository repository,
            Clock clock) {
        return new OfflineEntityVersionService(repository, clock);
    }

    /**
     * Keyed on its own type rather than on {@link OfflineChangeBroadcaster},
     * because this class wears two hats: it is the broadcaster, and it is also
     * the server-sent-events transport that the heartbeat controller and the
     * sync service talk to directly. Withdrawing it because a consumer supplied
     * a different broadcaster would take the heartbeat endpoint down with it.
     */
    @Bean
    @ConditionalOnMissingBean
    OfflineSseAudienceResolver starterOfflineSseAudienceResolver() {
        return new DenyAllOfflineSseAudienceResolver();
    }

    @Bean
    @ConditionalOnMissingBean
    OfflineHeartbeatService starterOfflineHeartbeatService(Clock clock,
            OfflineSseAudienceResolver audienceResolver, ApplicationEventPublisher events) {
        return new OfflineHeartbeatService(clock, audienceResolver, events);
    }

    /**
     * Resolves the actor a replayed command is attributed to. The privileged role
     * it compares against is a property rather than a constant, for the same
     * reason no role is named anywhere else in the library.
     */
    @Bean
    @ConditionalOnMissingBean(OfflineActorResolver.class)
    StarterOfflineActorResolver starterOfflineActorResolver(StarterOfflineProperties properties) {
        return new StarterOfflineActorResolver(properties.getPrivilegedRole());
    }

    @Bean
    @ConditionalOnMissingBean
    OfflineSyncTransactionOperations starterOfflineSyncTransactionOperations(
            PlatformTransactionManager transactionManager) {
        return new OfflineSyncTransactionOperations(transactionManager);
    }

    @Bean
    @ConditionalOnMissingBean
    OfflineDataLifecyclePolicy starterOfflineDataLifecyclePolicy(StarterOfflineProperties properties) {
        return new SafeDefaultOfflineDataLifecyclePolicy(properties);
    }

    @Bean
    @ConditionalOnMissingBean
    OfflineDataLifecycleService starterOfflineDataLifecycleService(OfflineSyncCommandRepository repository,
            StarterOfflineProperties properties, Clock clock, ApplicationEventPublisher events) {
        return new OfflineDataLifecycleService(repository, properties, clock, events);
    }

    @Bean
    @ConditionalOnMissingBean
    OfflineSyncService starterOfflineSyncService(OfflineHeartbeatService offlineHeartbeatService,
            OfflineSyncCommandRepository repository, ObjectMapper objectMapper, OfflineActorResolver actorResolver,
            List<OfflineSyncReplayHandler> replayHandlers,
            QueryEngineFilterSpecificationBuilder filterSpecificationBuilder, StarterOfflineProperties properties,
            Clock clock, OfflineSyncTransactionOperations transactionOperations,
            OfflineDataLifecyclePolicy lifecyclePolicy, OfflineDataLifecycleService lifecycleService,
            ApplicationEventPublisher events) {
        return new OfflineSyncService(offlineHeartbeatService, repository, objectMapper, actorResolver, replayHandlers,
                filterSpecificationBuilder, properties, clock, transactionOperations, lifecyclePolicy, lifecycleService,
                events);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnProperty(prefix = "vireo.starter.offline", name = "sync-endpoint-enabled", havingValue = "true", matchIfMissing = true)
    OfflineSyncController starterOfflineSyncController(OfflineSyncService offlineSyncService) {
        return new OfflineSyncController(offlineSyncService);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnProperty(prefix = "vireo.starter.offline", name = "heartbeat-endpoint-enabled", havingValue = "true", matchIfMissing = true)
    OfflineHeartbeatController starterOfflineHeartbeatController(OfflineHeartbeatService offlineHeartbeatService) {
        return new OfflineHeartbeatController(offlineHeartbeatService);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnProperty(prefix = "vireo.starter.offline", name = "hydration-endpoint-enabled", havingValue = "true", matchIfMissing = true)
    OfflineHydrationController starterOfflineHydrationController(
            OfflineEntityVersionService offlineEntityVersionService, StarterOfflineProperties properties) {
        return new OfflineHydrationController(offlineEntityVersionService, properties);
    }
}
