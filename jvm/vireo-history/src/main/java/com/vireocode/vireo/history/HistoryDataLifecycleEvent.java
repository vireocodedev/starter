package com.vireocode.vireo.history;

/** Identity- and payload-free lifecycle event suitable for metrics or audit sinks. */
public record HistoryDataLifecycleEvent(Operation operation, long affectedRecords, long heldRecords) {

    public enum Operation {
        CLASSIFIED,
        PURGED,
        ERASED,
        HOLD_PLACED,
        HOLD_RELEASED,
        QUOTA_REJECTED
    }
}
