package com.vireocode.starter.offline;

import java.time.Instant;
import java.util.List;

public record OfflineHydrationVersionsResponseDto(
        Instant serverTime,
        List<OfflineHydrationEntityVersionDto> versions) {
}
