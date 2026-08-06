package com.vireocode.starter.offline;

import java.util.List;

public record OfflineSyncBatchResponseDto(
        int accepted,
        int failed,
        List<OfflineSyncCommandResultDto> results) {
}
