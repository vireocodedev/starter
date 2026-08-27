package com.vireocode.offline;

import java.time.Instant;
import java.util.List;

public record OfflineHydrationVersionsResponseDto(
        Instant serverTime,
        List<OfflineHydrationEntityVersionDto> versions) {

    public OfflineHydrationVersionsResponseDto {
        versions = versions == null ? List.of() : List.copyOf(versions);
    }
}
