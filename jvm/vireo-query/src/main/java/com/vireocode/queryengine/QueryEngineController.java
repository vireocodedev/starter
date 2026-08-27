package com.vireocode.queryengine;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vireocode.security.SecurityExpressions;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("${vireo.starter.query-engine.endpoint-path:/api/queryengine}")
@Tag(name = "Query Engine")
@PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
public class QueryEngineController {

    private final QueryEngineRegistry registry;
    private final QueryEngineMetadataGenerator generator;
    private final QueryEngineRelationOptionService relationOptionService;

    public QueryEngineController(QueryEngineRegistry registry, QueryEngineMetadataGenerator generator,
            QueryEngineRelationOptionService relationOptionService) {
        this.registry = registry;
        this.generator = generator;
        this.relationOptionService = relationOptionService;
    }

    @GetMapping("/entities")
    public List<QueryEntitySummary> listEntities() {
        return getSortedEntityTypes().entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new QueryEntitySummary(
                        entry.getKey(),
                        entry.getValue().getName(),
                        countFilterableFields(generator.generate(entry.getKey(), entry.getValue()).fields())))
                .toList();
    }

    @GetMapping("/entities/config")
    public QueryEngineEntitiesConfig getEntitiesConfig() {
        Map<String, Class<?>> entityTypes = getSortedEntityTypes();

        List<QueryEntitySummary> entities = entityTypes.entrySet().stream()
                .map(entry -> {
                    QueryEntityDefinition definition = generator.generate(entry.getKey(), entry.getValue());
                    return new QueryEntitySummary(
                            entry.getKey(),
                            entry.getValue().getName(),
                            countFilterableFields(definition.fields()));
                })
                .toList();

        Map<String, QueryEntityDefinition> entityDefinitions = entityTypes.entrySet().stream()
                .collect(LinkedHashMap::new,
                        (acc, entry) -> acc.put(entry.getKey(), generator.generate(entry.getKey(), entry.getValue())),
                        LinkedHashMap::putAll);

        return new QueryEngineEntitiesConfig(entities, entityDefinitions);
    }

    @GetMapping("/entities/{entityKey}")
    public QueryEntityDefinition describeEntity(@PathVariable String entityKey) {
        Class<?> entityType = registry.requireEntityType(entityKey);
        return generator.generate(entityKey, entityType);
    }

    @GetMapping("/entities/{entityKey}/fields/{fieldPath}/options")
    public List<QueryRelationOption> listRelationOptions(@PathVariable String entityKey,
            @PathVariable String fieldPath,
            @RequestParam(required = false, name = "searchText") String searchText) {
        return relationOptionService.listOptions(entityKey, fieldPath, searchText);
    }

    private int countFilterableFields(List<QueryFieldDefinition> fields) {
        return fields.stream()
                .mapToInt(field -> 1 + countFilterableFields(field.children()))
                .sum();
    }

    private Map<String, Class<?>> getSortedEntityTypes() {
        return registry.getEntityTypes().entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(LinkedHashMap::new,
                        (acc, entry) -> acc.put(entry.getKey(), entry.getValue()),
                        LinkedHashMap::putAll);
    }
}
