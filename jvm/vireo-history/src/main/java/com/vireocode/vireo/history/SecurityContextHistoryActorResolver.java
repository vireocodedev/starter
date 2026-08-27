package com.vireocode.vireo.history;

import java.util.Optional;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Default actor resolver that depends only on Spring Security's neutral API. */
final class SecurityContextHistoryActorResolver implements HistoryActorResolver {

    @Override
    public Optional<HistoryActor> resolveCurrentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }

        String label = authentication.getName();
        if (label == null || label.isBlank()) {
            return Optional.empty();
        }
        return Optional.of(new HistoryActor(null, label));
    }
}
