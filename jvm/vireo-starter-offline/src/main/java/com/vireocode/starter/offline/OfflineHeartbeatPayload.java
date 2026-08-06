package com.vireocode.starter.offline;

import java.time.Instant;

public record OfflineHeartbeatPayload(
        Instant serverTime,
        boolean syncInProgress) {
}
