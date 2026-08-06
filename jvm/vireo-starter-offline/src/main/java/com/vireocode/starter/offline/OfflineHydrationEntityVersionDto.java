package com.vireocode.starter.offline;

import java.time.Instant;

public record OfflineHydrationEntityVersionDto(
        String entity,
        long revision,
        Instant changedAt) {
}
