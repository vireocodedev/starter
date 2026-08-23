package com.vireocode.starter.offline;

import java.util.List;

public record OfflineSyncBatchResponseDto(
        int accepted,
        int failed,
        List<OfflineSyncCommandResultDto> results) {

    public OfflineSyncBatchResponseDto {
        results = results == null ? List.of() : List.copyOf(results);
        if (accepted < 0 || failed < 0 || accepted + failed != results.size()) {
            throw new IllegalArgumentException("Offline sync response counts must match its results.");
        }
    }
}
