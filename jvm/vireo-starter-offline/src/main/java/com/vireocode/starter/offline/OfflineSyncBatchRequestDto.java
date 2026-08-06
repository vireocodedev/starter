package com.vireocode.starter.offline;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record OfflineSyncBatchRequestDto(
        @NotNull List<@Valid OfflineSyncCommandDto> commands) {
}
