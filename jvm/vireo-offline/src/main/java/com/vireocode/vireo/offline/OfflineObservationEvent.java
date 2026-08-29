package com.vireocode.vireo.offline;

import java.util.Objects;

/**
 * Identity-, URL-, and payload-free Offline operational event. Only bounded
 * enums may become tags; counts and elapsed time remain numeric measurements.
 */
public record OfflineObservationEvent(
        Operation operation,
        Outcome outcome,
        long itemCount,
        long durationNanos) {

    public OfflineObservationEvent {
        Objects.requireNonNull(operation, "operation");
        Objects.requireNonNull(outcome, "outcome");
        if (itemCount < 0 || durationNanos < 0) {
            throw new IllegalArgumentException("offline observation measurements must not be negative");
        }
    }

    /** Stable operation families. */
    public enum Operation {
        BATCH,
        REPLAY,
        QUEUE,
        SSE_CONNECT,
        SSE_HEARTBEAT,
        SSE_BATCH,
        SSE_CHANGE
    }

    /** Stable low-cardinality outcomes across Offline operations. */
    public enum Outcome {
        COMPLETED,
        PARTIAL,
        APPLIED,
        ALREADY_APPLIED,
        RETRYABLE,
        REJECTED,
        RETRY_LIMIT_EXCEEDED,
        CONFLICT,
        ADMITTED,
        RETRY_SCHEDULED,
        CONNECTED,
        DELIVERED,
        DISCARDED,
        DISCONNECTED,
        DENIED,
        ERROR
    }
}
