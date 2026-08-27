package com.vireocode.vireo.queryengine;

import java.util.List;
import java.util.Map;

public record QueryEngineEntitiesConfig(
        List<QueryEntitySummary> entities,
        Map<String, QueryEntityDefinition> entityDefinitions) {

    public QueryEngineEntitiesConfig {
        entities = entities == null ? List.of() : List.copyOf(entities);
        entityDefinitions = entityDefinitions == null ? Map.of() : Map.copyOf(entityDefinitions);
    }
}
