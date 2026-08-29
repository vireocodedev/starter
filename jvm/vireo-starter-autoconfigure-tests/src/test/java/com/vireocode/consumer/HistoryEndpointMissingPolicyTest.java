package com.vireocode.consumer;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

@SpringBootTest
class HistoryEndpointMissingPolicyTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void endpointIsAbsentButRecordingRemainsAvailableWithoutApplicationPolicy() {
        assertThat(context.containsBean("starterHistoryController")).isFalse();
        assertThat(context.containsBean("starterHistoryRecorder")).isTrue();
    }
}
