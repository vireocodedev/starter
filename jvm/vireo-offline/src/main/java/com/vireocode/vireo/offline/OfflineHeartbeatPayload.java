package com.vireocode.vireo.offline;

import java.time.Instant;

public record OfflineHeartbeatPayload(
        Instant serverTime,
        boolean syncInProgress) {
}
