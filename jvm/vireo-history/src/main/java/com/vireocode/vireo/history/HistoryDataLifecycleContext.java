package com.vireocode.vireo.history;

import java.time.Instant;

import tools.jackson.databind.JsonNode;

/** Input presented to an application's History data-classification policy. */
public record HistoryDataLifecycleContext(
        Instant occurredAt,
        HistoryActor actor,
        String entity,
        String entityId,
        JsonNode snapshotPrevious,
        JsonNode snapshotCurrent) {
}
