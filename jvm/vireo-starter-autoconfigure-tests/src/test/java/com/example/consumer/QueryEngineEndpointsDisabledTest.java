package com.example.consumer;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import com.vireocode.queryengine.QueryEngineRegistry;
import com.vireocode.queryengine.savedfilter.SavedFilterService;

@SpringBootTest(properties = {
        "vireo.starter.query-engine.endpoint-enabled=false",
        "vireo.starter.query-engine.saved-filters-endpoint-enabled=false"
})
class QueryEngineEndpointsDisabledTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void endpointsCanBeDisabledWithoutDisablingQueryEngineServices() {
        assertThat(context.containsBean("queryEngineController")).isFalse();
        assertThat(context.containsBean("savedFilterController")).isFalse();
        assertThat(context.getBean(QueryEngineRegistry.class)).isNotNull();
        assertThat(context.getBean(SavedFilterService.class)).isNotNull();
    }
}
