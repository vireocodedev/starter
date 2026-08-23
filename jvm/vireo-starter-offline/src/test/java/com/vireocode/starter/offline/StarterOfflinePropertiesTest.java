package com.vireocode.starter.offline;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;

class StarterOfflinePropertiesTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(PropertiesConfiguration.class);

    @Test
    void defaultsAreBound() {
        contextRunner.run(context -> {
            StarterOfflineProperties properties = context.getBean(StarterOfflineProperties.class);

            assertThat(properties.isSyncEndpointEnabled()).isTrue();
            assertThat(properties.isHeartbeatEndpointEnabled()).isTrue();
            assertThat(properties.isHydrationEndpointEnabled()).isTrue();
            assertThat(properties.getSyncEndpointPath()).isEqualTo("/api/offline/sync");
            assertThat(properties.getHeartbeatEndpointPath()).isEqualTo("/api/offline/heartbeat");
            assertThat(properties.getHydrationEndpointPath()).isEqualTo("/api/offline/hydration");
            assertThat(properties.getMaxBatchSize()).isEqualTo(100);
            assertThat(properties.getMaxReplayAttempts()).isEqualTo(5);
            assertThat(properties.getMaxHydrationEntities()).isEqualTo(100);
            assertThat(properties.getHeartbeatInterval()).isEqualTo(Duration.ofSeconds(1));
            assertThat(properties.getReplayMethods()).containsExactly("POST", "PUT", "PATCH", "DELETE");
            assertThat(properties.getExcludedReplayPathPrefixes()).containsExactly("/api/auth", "/api/offline/");
            assertThat(properties.getReplayHeaders())
                    .containsExactly("Content-Type", "Idempotency-Key", "X-Offline-Temp-Id");
        });
    }

    @Test
    void invalidEndpointAndReplayPoliciesFailAtStartup() {
        contextRunner.withPropertyValues("vireo.starter.offline.sync-endpoint-path=relative")
                .run(context -> assertThat(context).hasFailed());
        contextRunner.withPropertyValues(
                "vireo.starter.offline.sync-endpoint-path=/same",
                "vireo.starter.offline.heartbeat-endpoint-path=/same")
                .run(context -> assertThat(context).hasFailed());
        contextRunner.withPropertyValues("vireo.starter.offline.replay-methods=GET")
                .run(context -> assertThat(context).hasFailed());
        contextRunner.withPropertyValues("vireo.starter.offline.heartbeat-interval=0s")
                .run(context -> assertThat(context).hasFailed());
    }

    @Test
    void consumerOverridesAreNormalizedAndBound() {
        contextRunner.withPropertyValues(
                "vireo.starter.offline.max-batch-size=8",
                "vireo.starter.offline.max-replay-attempts=3",
                "vireo.starter.offline.max-hydration-entities=12",
                "vireo.starter.offline.replay-methods=POST,PATCH",
                "vireo.starter.offline.replay-headers=Idempotency-Key")
                .run(context -> {
                    StarterOfflineProperties properties = context.getBean(StarterOfflineProperties.class);
                    assertThat(properties.getMaxBatchSize()).isEqualTo(8);
                    assertThat(properties.getMaxReplayAttempts()).isEqualTo(3);
                    assertThat(properties.getMaxHydrationEntities()).isEqualTo(12);
                    assertThat(properties.getReplayMethods()).isEqualTo(List.of("POST", "PATCH"));
                    assertThat(properties.getReplayHeaders()).containsExactly("Idempotency-Key");
                });
    }

    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties(StarterOfflineProperties.class)
    static class PropertiesConfiguration {
    }
}
