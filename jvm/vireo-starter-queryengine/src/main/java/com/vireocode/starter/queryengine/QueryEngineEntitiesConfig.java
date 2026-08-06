package com.vireocode.starter.queryengine;

import java.util.List;
import java.util.Map;

public record QueryEngineEntitiesConfig(
        List<QueryEntitySummary> entities,
        Map<String, QueryEntityDefinition> entityDefinitions) {
}