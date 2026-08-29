package com.vireocode.vireo.history;

import org.springframework.security.core.Authentication;

/**
 * Application-owned record-level authorization policy for the default History endpoint.
 *
 * <p>No permissive implementation is installed by the module. The HTTP endpoint is absent until the application
 * supplies this policy as a bean named {@code historyReadAuthorizer}.
 */
@FunctionalInterface
public interface HistoryReadAuthorizer {

    /**
     * Returns whether {@code authentication} may read this entity's history.
     */
    boolean canRead(Authentication authentication, String entity, String entityId);
}
