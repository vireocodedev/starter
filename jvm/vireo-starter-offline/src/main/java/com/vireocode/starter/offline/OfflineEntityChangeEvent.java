package com.vireocode.starter.offline;

public record OfflineEntityChangeEvent(
        String entity,
        Object payload,
        Long revision) {
}