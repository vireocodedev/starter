package com.vireocode.vireo.offline;

public record OfflineSseBatchItem(
        String action,
        String entity,
        Object payload,
        Long revision) {
}