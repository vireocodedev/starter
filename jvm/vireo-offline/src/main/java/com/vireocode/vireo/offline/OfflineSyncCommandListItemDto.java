package com.vireocode.vireo.offline;

import java.time.Instant;
import java.util.UUID;

public record OfflineSyncCommandListItemDto(
        UUID commandId,
        String httpMethod,
        String url,
        String requestBody,
        OfflineSyncCommandStatus status,
        Integer responseStatus,
        String errorMessage,
        Instant createdAt,
        Instant processedAt) {
}
