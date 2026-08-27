package com.vireocode.docs.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.vireocode.vireo.auth.StarterHttpSecurityCustomizer;

@Configuration(proxyBeanMethods = false)
public class AuthSecurityConfigurationExample {

    @Bean
    StarterHttpSecurityCustomizer applicationSecurityRules() {
        return http -> http.authorizeHttpRequests(authorization -> authorization
                .requestMatchers("/api/health", "/api/registration").permitAll());
    }
}
