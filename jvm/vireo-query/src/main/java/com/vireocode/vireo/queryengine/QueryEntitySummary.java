package com.vireocode.vireo.queryengine;

public record QueryEntitySummary(
        String key,
        String javaType,
        int filterableFieldCount) {
}