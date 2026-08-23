package com.vireocode.starter.docs.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.vireocode.starter.auth.StarterHttpSecurityCustomizer;

@Configuration(proxyBeanMethods = false)
public class AuthSecurityConfigurationExample {

    @Bean
    StarterHttpSecurityCustomizer applicationSecurityRules() {
        return http -> http.authorizeHttpRequests(authorization -> authorization
                .requestMatchers("/api/health", "/api/registration").permitAll());
    }
}
