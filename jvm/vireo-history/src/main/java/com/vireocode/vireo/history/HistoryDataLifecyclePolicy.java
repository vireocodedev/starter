package com.vireocode.vireo.history;

/**
 * Application seam for classifying, partitioning, redacting, retaining, and
 * legally holding History records before persistence.
 */
@FunctionalInterface
public interface HistoryDataLifecyclePolicy {

    HistoryDataLifecycleDecision classify(HistoryDataLifecycleContext context);
}
