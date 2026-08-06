package com.vireocode.starter.history;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonRawValue;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Read model for a single history row. The {@code action} is intentionally not
 * stored; the frontend derives it from the snapshot pair.
 */
@Getter
@Setter
@NoArgsConstructor
public class HistoryEntryDTO {

    private UUID id;
    private Instant timestamp;
    private UUID ownerId;
    private String ownerUsername;
    private String entity;
    private String entityId;
    @JsonRawValue
    private String snapshotPrevious;
    @JsonRawValue
    private String snapshotCurrent;
}
