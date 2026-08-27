package com.vireocode.vireo.history;

import org.springframework.security.core.Authentication;

/** Application-owned authorization policy for the default History endpoint. */
@FunctionalInterface
public interface HistoryReadAuthorizer {

    /**
     * Returns whether {@code authentication} may read this entity's history.
     */
    boolean canRead(Authentication authentication, String entity, String entityId);
}
