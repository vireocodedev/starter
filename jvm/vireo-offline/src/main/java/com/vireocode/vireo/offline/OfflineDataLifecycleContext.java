package com.vireocode.vireo.offline;

import java.time.Instant;

/** Command metadata presented to the application lifecycle policy before storage. */
public record OfflineDataLifecycleContext(
        Instant createdAt,
        OfflineActor actor,
        String ownerKey,
        OfflineSyncCommandDto command,
        String serializedBody,
        String serializedHeaders) {
}
