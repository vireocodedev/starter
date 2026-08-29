package com.vireocode.vireo.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration;
import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.introspect.DefaultAccessorNamingStrategy;

class JsonConfigTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withConfiguration(AutoConfigurations.of(JacksonAutoConfiguration.class))
            .withUserConfiguration(JsonConfig.class, ConsumerJsonConfiguration.class);

    @Test
    void consumerCustomizerCanOverrideTheStarterConventionByOrderingAfterIt() {
        contextRunner.run(context -> {
            ObjectMapper objectMapper = context.getBean(ObjectMapper.class);

            assertThat(objectMapper.writeValueAsString(new BooleanModel(true)))
                    .isEqualTo("{\"active\":true}");
        });
    }

    static final class BooleanModel {

        private final boolean active;

        BooleanModel(boolean active) {
            this.active = active;
        }

        public boolean isActive() {
            return active;
        }
    }

    @Configuration(proxyBeanMethods = false)
    static class ConsumerJsonConfiguration {

        @Bean
        @Order(Ordered.LOWEST_PRECEDENCE)
        JsonMapperBuilderCustomizer consumerJsonNaming() {
            return builder -> builder.accessorNaming(new DefaultAccessorNamingStrategy.Provider());
        }
    }
}
