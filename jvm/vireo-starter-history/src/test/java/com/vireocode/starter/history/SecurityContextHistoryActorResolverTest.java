package com.vireocode.starter.history;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

class SecurityContextHistoryActorResolverTest {

    private final SecurityContextHistoryActorResolver resolver = new SecurityContextHistoryActorResolver();

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void resolvesAuthenticatedPrincipalWithoutAssumingItsType() {
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(
                        new Object(), "ignored", List.of(new SimpleGrantedAuthority("ROLE_USER"))));

        assertThat(resolver.resolveCurrentActor())
                .contains(new HistoryActor(null, SecurityContextHolder.getContext().getAuthentication().getName()));
    }

    @Test
    void leavesAnonymousActivityUnattributed() {
        SecurityContextHolder.getContext().setAuthentication(new AnonymousAuthenticationToken(
                "key", "anonymousUser", List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"))));

        assertThat(resolver.resolveCurrentActor()).isEmpty();
    }
}
