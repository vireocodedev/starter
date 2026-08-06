package com.vireocode.starter.queryengine;

import java.util.List;

public record QueryEntityDefinition(
        String key,
        String title,
        String javaType,
        List<QueryFieldDefinition> fields) {
}