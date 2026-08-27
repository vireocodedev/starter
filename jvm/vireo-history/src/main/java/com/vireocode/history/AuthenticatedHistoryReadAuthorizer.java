package com.vireocode.history;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;

/** Default read policy: any authenticated, non-anonymous principal. */
final class AuthenticatedHistoryReadAuthorizer implements HistoryReadAuthorizer {

    @Override
    public boolean canRead(Authentication authentication, String entity, String entityId) {
        return authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
    }
}
