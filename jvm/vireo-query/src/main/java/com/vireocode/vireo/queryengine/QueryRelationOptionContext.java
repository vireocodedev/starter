package com.vireocode.vireo.queryengine;

/** Immutable request context supplied to an application's relation-option policy. */
public record QueryRelationOptionContext(
        String sourceEntityKey,
        String fieldPath,
        String targetEntityKey,
        Class<?> targetEntityType) {
}
