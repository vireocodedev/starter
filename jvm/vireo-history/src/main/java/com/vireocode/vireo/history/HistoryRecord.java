package com.vireocode.vireo.history;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Immutable HTTP read model for one history event.
 *
 * <p>
 * Its JSON representation intentionally matches the framework-free
 * {@code @vireocodedev/starter-history} record schema.
 *
 * @param id history event identifier
 * @param timestamp instant at which the event was recorded
 * @param actor application-neutral actor, or {@code null} for system activity
 * @param entity application-owned entity kind
 * @param entityId application-owned entity identifier
 * @param snapshotPrevious state before the event, or {@code null} for creation
 * @param snapshotCurrent state after the event, or {@code null} for deletion
 */
public record HistoryRecord(
        UUID id,
        Instant timestamp,
        HistoryActor actor,
        String entity,
        String entityId,
        JsonNode snapshotPrevious,
        JsonNode snapshotCurrent) {
}
