package com.vireocode.vireo.queryengine;

import java.util.Objects;

/** Safe completion event for relation-option queries; it contains no entity, field, search, or actor value. */
public record QueryRelationOptionObservationEvent(
        Outcome outcome,
        boolean searched,
        long resultCount,
        long durationNanos) {

    public QueryRelationOptionObservationEvent {
        Objects.requireNonNull(outcome, "outcome");
        if (resultCount < 0 || durationNanos < 0) {
            throw new IllegalArgumentException("relation-option observation measurements must not be negative");
        }
    }

    /** Bounded completion states suitable for low-cardinality tags. */
    public enum Outcome {
        SUCCESS,
        DENIED,
        REJECTED,
        ERROR
    }
}
