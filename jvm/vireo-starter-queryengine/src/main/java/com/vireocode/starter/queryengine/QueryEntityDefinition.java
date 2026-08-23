package com.vireocode.starter.queryengine;

import java.util.List;

public record QueryEntityDefinition(
        String key,
        String title,
        String javaType,
        List<QueryFieldDefinition> fields) {

    public QueryEntityDefinition {
        fields = fields == null ? List.of() : List.copyOf(fields);
    }
}
