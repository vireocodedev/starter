package com.vireocode.vireo.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;

class StarterAuthPropertiesTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(PropertiesConfiguration.class);

    @Test
    void defaultsAreBound() {
        contextRunner.run(context -> {
            StarterAuthProperties properties = context.getBean(StarterAuthProperties.class);

            assertThat(properties.isEndpointsEnabled()).isTrue();
            assertThat(properties.isAccountEndpointsEnabled()).isTrue();
            assertThat(properties.getLoginPath()).isEqualTo("/api/auth/login");
            assertThat(properties.getLogoutPath()).isEqualTo("/api/auth/logout");
            assertThat(properties.getCurrentUserPath()).isEqualTo("/api/auth/me");
            assertThat(properties.getChangeUsernamePath()).isEqualTo("/api/account/username");
            assertThat(properties.getChangePasswordPath()).isEqualTo("/api/account/password");
            assertThat(properties.getApiPathPattern()).isEqualTo("/api/**");
        });
    }

    @Test
    void endpointPathsMustBeAbsoluteAndDistinct() {
        contextRunner
                .withPropertyValues("vireo.starter.auth.login-path=relative")
                .run(context -> assertThat(context).hasFailed());

        contextRunner
                .withPropertyValues(
                        "vireo.starter.auth.login-path=/session",
                        "vireo.starter.auth.logout-path=/session")
                .run(context -> assertThat(context).hasFailed());
    }

    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties(StarterAuthProperties.class)
    static class PropertiesConfiguration {
    }
}
