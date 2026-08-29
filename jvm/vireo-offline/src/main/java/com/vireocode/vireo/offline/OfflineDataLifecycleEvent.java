package com.vireocode.vireo.offline;

/** Identity- and payload-free Offline lifecycle event for metrics or audit sinks. */
public record OfflineDataLifecycleEvent(Operation operation, long affectedRecords, long heldRecords) {

    public enum Operation {
        CLASSIFIED,
        PURGED,
        ERASED,
        HOLD_PLACED,
        HOLD_RELEASED,
        QUOTA_REJECTED
    }
}
