package com.vireocode.starter.queryengine;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Holds the entity-key to JPA-entity bindings the query engine filters over.
 *
 * <p>
 * The key set is owned entirely by the application, through the
 * {@link QueryEntityTypeResolver} beans it publishes. The registry normalises
 * keys to upper case on the way in and compares case-insensitively on the way
 * out, so a request may spell a key however it likes.
 */
@Component
public class QueryEngineRegistry {

    private final Map<String, Class<?>> entityTypes;

    public QueryEngineRegistry() {
        this(List.of());
    }

    @Autowired
    public QueryEngineRegistry(List<QueryEntityTypeResolver> resolvers) {
        Map<String, Class<?>> mutableEntityTypes = new LinkedHashMap<>();
        for (QueryEntityTypeResolver resolver : resolvers) {
            resolver.entityTypes().forEach((key, entityType) -> {
                String normalized = normalize(key.name());
                Class<?> previous = mutableEntityTypes.put(normalized, entityType);
                if (previous != null && !previous.equals(entityType)) {
                    throw new IllegalStateException("Duplicate query engine entity key '" + normalized
                            + "' bound to both " + previous.getName() + " and " + entityType.getName());
                }
            });
        }

        this.entityTypes = Map.copyOf(mutableEntityTypes);
    }

    public List<QueryEntitySummary> listEntities() {
        return entityTypes.entrySet().stream()
                .map(entry -> new QueryEntitySummary(entry.getKey(), entry.getValue().getName(), 0))
                .toList();
    }

    public Class<?> requireEntityType(String entityKey) {
        Class<?> entityType = entityTypes.get(normalize(entityKey));
        if (entityType == null) {
            throw new IllegalArgumentException("Unknown query engine entity: " + entityKey);
        }

        return entityType;
    }

    public String requireEntityKey(Class<?> entityType) {
        return entityTypes.entrySet().stream()
                .filter(entry -> entry.getValue().equals(entityType))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElseGet(() -> toEntityKey(entityType));
    }

    public Map<String, Class<?>> getEntityTypes() {
        return entityTypes;
    }

    private static String normalize(String entityKey) {
        if (entityKey == null || entityKey.isBlank()) {
            throw new IllegalArgumentException("Unknown query engine entity: " + entityKey);
        }

        return entityKey.trim().toUpperCase();
    }

    private String toEntityKey(Class<?> entityType) {
        String simpleName = entityType.getSimpleName();
        return simpleName
                .replaceAll("([a-z0-9])([A-Z])", "$1_$2")
                .toUpperCase();
    }
}
