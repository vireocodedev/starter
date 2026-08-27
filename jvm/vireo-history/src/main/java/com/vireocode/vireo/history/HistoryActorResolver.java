package com.vireocode.vireo.history;

import java.util.Optional;

/**
 * Resolves the actor responsible for the operation currently being recorded.
 *
 * <p>
 * Applications with domain-specific principals may replace the default Spring
 * Security resolver with a bean of this type. An empty result represents
 * system or otherwise unattributed activity.
 */
@FunctionalInterface
public interface HistoryActorResolver {

    /** Returns the current actor, or an empty result for system activity. */
    Optional<HistoryActor> resolveCurrentActor();
}
