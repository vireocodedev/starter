package com.vireocode.starter.offline;

import java.util.List;

public record OfflineSseBatchEvent(String batchId, List<OfflineSseBatchItem> events) {
    public OfflineSseBatchEvent {
        events = events == null ? List.of() : List.copyOf(events);
    }
}
