package com.vireocode.vireo.offline;

import java.time.Instant;

/** Redacted persisted payload and lifecycle metadata for one Offline command. */
public record OfflineDataLifecycleDecision(
        String partitionKey,
        Instant retainUntil,
        boolean legalHold,
        String requestBody,
        String requestHeaders) {

    public OfflineDataLifecycleDecision {
        if (partitionKey == null || partitionKey.isBlank() || partitionKey.length() > 140) {
            throw new IllegalArgumentException("offline partitionKey must contain 1 to 140 characters");
        }
        if (retainUntil == null) {
            throw new IllegalArgumentException("offline retainUntil must not be null");
        }
        partitionKey = partitionKey.trim();
    }
}
