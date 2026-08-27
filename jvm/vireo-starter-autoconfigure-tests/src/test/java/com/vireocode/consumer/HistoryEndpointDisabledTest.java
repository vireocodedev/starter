package com.vireocode.consumer;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

@SpringBootTest(properties = "vireo.starter.history.endpoint-enabled=false")
class HistoryEndpointDisabledTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void endpointCanBeDisabledWithoutDisablingRecording() {
        assertThat(context.containsBean("starterHistoryController")).isFalse();
        assertThat(context.containsBean("starterHistoryRecorder")).isTrue();
    }
}
