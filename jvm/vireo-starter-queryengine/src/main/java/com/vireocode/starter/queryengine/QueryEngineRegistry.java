package com.vireocode.starter.queryengine;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;

/**
 * Holds the entity-key to JPA-entity bindings the query engine filters over.
 *
 * <p>
 * The key set is owned entirely by the application, through the
 * {@link QueryEntityTypeResolver} beans it publishes. The registry normalises
 * keys to upper case on the way in and compares case-insensitively on the way
 * out, so a request may spell a key however it likes.
 */
public class QueryEngineRegistry {

    private final Map<String, Class<?>> entityTypes;

    public QueryEngineRegistry() {
        this(List.of());
    }

    @Autowired
    public QueryEngineRegistry(List<QueryEntityTypeResolver> resolvers) {
        Map<String, Class<?>> mutableEntityTypes = new LinkedHashMap<>();
        for (QueryEntityTypeResolver resolver : List.copyOf(Objects.requireNonNull(resolvers, "resolvers must not be null"))) {
            Map<QueryEntityKey, Class<?>> resolvedTypes = Objects.requireNonNull(
                    Objects.requireNonNull(resolver, "resolver must not be null").entityTypes(),
                    "resolver entityTypes must not be null");
            resolvedTypes.forEach((key, entityType) -> {
                Objects.requireNonNull(key, "query entity key must not be null");
                Objects.requireNonNull(entityType, "query entity type must not be null");
                String normalized = normalize(key.name());
                Class<?> previous = mutableEntityTypes.putIfAbsent(normalized, entityType);
                if (previous != null) {
                    throw new IllegalStateException("Duplicate query engine entity key '" + normalized + "'"
                            + (previous.equals(entityType) ? "" : " bound to both " + previous.getName()
                                    + " and " + entityType.getName()));
                }
            });
        }

        this.entityTypes = java.util.Collections.unmodifiableMap(new LinkedHashMap<>(mutableEntityTypes));
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
        Objects.requireNonNull(entityType, "entityType must not be null");
        return entityTypes.entrySet().stream()
                .filter(entry -> entry.getValue().equals(entityType))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unregistered query engine entity type: " + entityType.getName()));
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
}
