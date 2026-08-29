package com.vireocode.vireo.offline;

/** Application seam for Offline payload redaction, partitioning, retention, and legal hold. */
@FunctionalInterface
public interface OfflineDataLifecyclePolicy {

    OfflineDataLifecycleDecision classify(OfflineDataLifecycleContext context);
}
