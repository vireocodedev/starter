package com.vireocode.starter.docs.history;

import java.util.Optional;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.vireocode.starter.history.HistoryActor;
import com.vireocode.starter.history.HistoryActorResolver;
import com.vireocode.starter.history.HistoryReadAuthorizer;

@Configuration(proxyBeanMethods = false)
public class HistorySecurityConfigurationExample {

    @Bean
    HistoryActorResolver applicationHistoryActorResolver() {
        return () -> Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .filter(Authentication::isAuthenticated)
                .filter(authentication -> !(authentication instanceof AnonymousAuthenticationToken))
                .map(authentication -> new HistoryActor(null, authentication.getName()));
    }

    @Bean("historyReadAuthorizer")
    HistoryReadAuthorizer applicationHistoryReadAuthorizer() {
        return (authentication, entity, entityId) -> authentication != null
                && authentication.isAuthenticated()
                && authentication.getAuthorities().stream()
                        .anyMatch(authority -> "HISTORY_READ".equals(authority.getAuthority()));
    }
}
