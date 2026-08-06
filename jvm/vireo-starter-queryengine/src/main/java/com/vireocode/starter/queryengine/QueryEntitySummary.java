package com.vireocode.starter.queryengine;

public record QueryEntitySummary(
        String key,
        String javaType,
        int filterableFieldCount) {
}