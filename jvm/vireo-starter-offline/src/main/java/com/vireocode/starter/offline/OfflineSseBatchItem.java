package com.vireocode.starter.offline;

public record OfflineSseBatchItem(
        String action,
        String entity,
        Object payload,
        Long revision) {
}