package com.vireocode.starter.offline;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vireocode.starter.queryengine.QueryEngineFilterSpecificationBuilder;
import com.vireocode.starter.spi.OfflineChangeBroadcaster;
import com.vireocode.starter.spi.OfflineRevisionTracker;

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
public class StarterOfflineAutoConfiguration {

    /**
     * Keyed on its own type for the same reason as the heartbeat service: it is
     * the {@link OfflineRevisionTracker} implementation, but the hydration
     * controller depends on the concrete class.
     */
    @Bean
    @ConditionalOnMissingBean
    OfflineEntityVersionService starterOfflineEntityVersionService(OfflineEntityVersionRepository repository) {
        return new OfflineEntityVersionService(repository);
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
    OfflineHeartbeatService starterOfflineHeartbeatService() {
        return new OfflineHeartbeatService();
    }

    /**
     * Resolves the actor a replayed command is attributed to. The privileged role
     * it compares against is a property rather than a constant, for the same
     * reason no role is named anywhere else in the library.
     */
    @Bean
    @ConditionalOnMissingBean(OfflineActorResolver.class)
    StarterOfflineActorResolver starterOfflineActorResolver(
            @Value("${vireo.starter.offline.privileged-role:SUPERADMIN}") String privilegedRole) {
        return new StarterOfflineActorResolver(privilegedRole);
    }

    @Bean
    @ConditionalOnMissingBean
    OfflineSyncService starterOfflineSyncService(OfflineHeartbeatService offlineHeartbeatService,
            OfflineSyncCommandRepository repository, ObjectMapper objectMapper, OfflineActorResolver actorResolver,
            List<OfflineSyncReplayHandler> replayHandlers,
            QueryEngineFilterSpecificationBuilder filterSpecificationBuilder) {
        return new OfflineSyncService(offlineHeartbeatService, repository, objectMapper, actorResolver, replayHandlers,
                filterSpecificationBuilder);
    }

    @Bean
    @ConditionalOnMissingBean
    OfflineSyncController starterOfflineSyncController(OfflineSyncService offlineSyncService) {
        return new OfflineSyncController(offlineSyncService);
    }

    @Bean
    @ConditionalOnMissingBean
    OfflineHeartbeatController starterOfflineHeartbeatController(OfflineHeartbeatService offlineHeartbeatService) {
        return new OfflineHeartbeatController(offlineHeartbeatService);
    }

    @Bean
    @ConditionalOnMissingBean
    OfflineHydrationController starterOfflineHydrationController(
            OfflineEntityVersionService offlineEntityVersionService) {
        return new OfflineHydrationController(offlineEntityVersionService);
    }
}
