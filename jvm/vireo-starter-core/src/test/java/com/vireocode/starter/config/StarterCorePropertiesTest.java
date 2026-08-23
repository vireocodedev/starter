package com.vireocode.starter.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.context.ConfigurationPropertiesAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

class StarterCorePropertiesTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withConfiguration(AutoConfigurations.of(ConfigurationPropertiesAutoConfiguration.class))
            .withUserConfiguration(PropertiesConfiguration.class)
            .withBean(LocalValidatorFactoryBean.class);

    @Test
    void bindsSecureDefaultsAndConsumerOverrides() {
        contextRunner.run(context -> {
            StarterCoreProperties properties = context.getBean(StarterCoreProperties.class);
            assertThat(properties.isExposeInternalErrorDetails()).isFalse();
            assertThat(properties.getSystemAuditor()).isEqualTo("system");
        });

        contextRunner.withPropertyValues(
                "vireo.starter.core.expose-internal-error-details=true",
                "vireo.starter.core.system-auditor=automation")
                .run(context -> {
                    StarterCoreProperties properties = context.getBean(StarterCoreProperties.class);
                    assertThat(properties.isExposeInternalErrorDetails()).isTrue();
                    assertThat(properties.getSystemAuditor()).isEqualTo("automation");
                });
    }

    @Test
    void rejectsBlankSystemAuditor() {
        contextRunner.withPropertyValues("vireo.starter.core.system-auditor= ")
                .run(context -> assertThat(context).hasFailed());
    }

    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties(StarterCoreProperties.class)
    static class PropertiesConfiguration {
    }
}
