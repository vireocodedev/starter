package com.example.consumer;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import com.vireocode.offline.OfflineEntityVersionService;
import com.vireocode.offline.OfflineHeartbeatService;
import com.vireocode.offline.OfflineSyncService;

@SpringBootTest(properties = {
        "vireo.starter.offline.sync-endpoint-enabled=false",
        "vireo.starter.offline.heartbeat-endpoint-enabled=false",
        "vireo.starter.offline.hydration-endpoint-enabled=false"
})
class OfflineEndpointsDisabledTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void endpointsCanBeDisabledWithoutDisablingOfflineServices() {
        assertThat(context.containsBean("starterOfflineSyncController")).isFalse();
        assertThat(context.containsBean("starterOfflineHeartbeatController")).isFalse();
        assertThat(context.containsBean("starterOfflineHydrationController")).isFalse();
        assertThat(context.getBean(OfflineSyncService.class)).isNotNull();
        assertThat(context.getBean(OfflineHeartbeatService.class)).isNotNull();
        assertThat(context.getBean(OfflineEntityVersionService.class)).isNotNull();
    }
}
