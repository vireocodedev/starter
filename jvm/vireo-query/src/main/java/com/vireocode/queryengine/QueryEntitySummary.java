package com.vireocode.queryengine;

public record QueryEntitySummary(
        String key,
        String javaType,
        int filterableFieldCount) {
}