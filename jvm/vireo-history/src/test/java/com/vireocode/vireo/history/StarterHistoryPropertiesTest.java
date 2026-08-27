package com.vireocode.vireo.history;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;

class StarterHistoryPropertiesTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(PropertiesConfiguration.class);

    @Test
    void defaultsAreBound() {
        contextRunner.run(context -> {
            StarterHistoryProperties properties = context.getBean(StarterHistoryProperties.class);
            assertThat(properties.isEndpointEnabled()).isTrue();
            assertThat(properties.getEndpointPath()).isEqualTo("/api/history");
            assertThat(properties.getDefaultLimit()).isEqualTo(200);
            assertThat(properties.getMaxLimit()).isEqualTo(500);
        });
    }

    @Test
    void defaultLimitCannotExceedMaximum() {
        contextRunner
                .withPropertyValues(
                        "vireo.starter.history.default-limit=20",
                        "vireo.starter.history.max-limit=10")
                .run(context -> assertThat(context).hasFailed());
    }

    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties(StarterHistoryProperties.class)
    static class PropertiesConfiguration {
    }
}
