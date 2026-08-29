package com.vireocode.vireo.observability;

import java.util.Objects;

/**
 * Identity- and payload-free completion event for a paged repository query.
 * Boolean dimensions and the bounded outcome enum are safe for metric tags;
 * numeric values remain measurements rather than labels.
 */
public record QueryExecutionObservationEvent(
        Outcome outcome,
        boolean searched,
        boolean filtered,
        long resultCount,
        long durationNanos) {

    public QueryExecutionObservationEvent {
        Objects.requireNonNull(outcome, "outcome");
        if (resultCount < 0 || durationNanos < 0) {
            throw new IllegalArgumentException("query observation measurements must not be negative");
        }
    }

    /** Bounded query completion states. */
    public enum Outcome {
        SUCCESS,
        DENIED,
        REJECTED,
        ERROR
    }
}
