package com.vireocode.vireo.history;

import java.time.Instant;

import tools.jackson.databind.JsonNode;

/** Persisted representation and lifecycle metadata selected by a History policy. */
public record HistoryDataLifecycleDecision(
        String partitionKey,
        Instant retainUntil,
        boolean legalHold,
        JsonNode snapshotPrevious,
        JsonNode snapshotCurrent) {

    public HistoryDataLifecycleDecision {
        if (partitionKey == null || partitionKey.isBlank() || partitionKey.length() > 140) {
            throw new IllegalArgumentException("history partitionKey must contain 1 to 140 characters");
        }
        if (retainUntil == null) {
            throw new IllegalArgumentException("history retainUntil must not be null");
        }
        partitionKey = partitionKey.trim();
    }
}
