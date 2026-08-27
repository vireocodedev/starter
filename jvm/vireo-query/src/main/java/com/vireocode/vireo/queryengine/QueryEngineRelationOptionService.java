package com.vireocode.vireo.queryengine;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;


import jakarta.persistence.EntityManager;
import jakarta.persistence.Id;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

public class QueryEngineRelationOptionService {

    @PersistenceContext
    private EntityManager entityManager;

    private final QueryEngineRegistry registry;
    private final QueryEngineMetadataGenerator generator;
    private final int resultLimit;

    public QueryEngineRelationOptionService(QueryEngineRegistry registry, QueryEngineMetadataGenerator generator) {
        this(registry, generator, new StarterQueryEngineProperties());
    }

    public QueryEngineRelationOptionService(QueryEngineRegistry registry, QueryEngineMetadataGenerator generator,
            StarterQueryEngineProperties properties) {
        this.registry = registry;
        this.generator = generator;
        this.resultLimit = properties.getRelationOptionsLimit();
    }

    public List<QueryRelationOption> listOptions(String entityKey, String fieldPath, String searchText) {
        QueryEntityDefinition entityDefinition = generator.generate(entityKey, registry.requireEntityType(entityKey));
        QueryFieldDefinition fieldDefinition = findField(entityDefinition.fields(), fieldPath);

        if (fieldDefinition == null || !fieldDefinition.relation()) {
            throw new IllegalArgumentException("Unknown relation field: " + fieldPath);
        }

        if (fieldDefinition.relationMode() == RelationFilterMode.CHILD || fieldDefinition.relationEntityKey() == null) {
            throw new IllegalArgumentException("Relation selection is not enabled for field: " + fieldPath);
        }

        Class<?> relationType = registry.requireEntityType(fieldDefinition.relationEntityKey());
        List<?> results = searchEntities(relationType, fieldDefinition.relationSelectionLabelFields(), searchText);

        List<QueryRelationOption> options = new ArrayList<>();
        for (Object entity : results) {
            String value = extractId(entity);
            String label = buildLabel(entity, fieldDefinition.relationSelectionLabelFields());
            options.add(new QueryRelationOption(value, label));
        }

        options.sort(Comparator.comparing(QueryRelationOption::label, String.CASE_INSENSITIVE_ORDER));
        return options;
    }

    List<?> searchEntities(Class<?> entityType, List<String> labelFields, String searchText) {
        return searchEntitiesTyped(entityType, labelFields, searchText);
    }

    private <T> List<T> searchEntitiesTyped(Class<T> entityType, List<String> labelFields, String searchText) {
        String normalizedSearchText = searchText == null ? "" : searchText.trim().toLowerCase(Locale.ROOT);
        var criteriaBuilder = entityManager.getCriteriaBuilder();
        var criteriaQuery = criteriaBuilder.createQuery(entityType);
        Root<T> root = criteriaQuery.from(entityType);
        criteriaQuery.select(root);

        if (!normalizedSearchText.isBlank()) {
            if (labelFields.isEmpty()) {
                throw new IllegalArgumentException("Relation option search requires at least one label field");
            }
            List<Predicate> predicates = labelFields.stream()
                    .map(field -> criteriaBuilder.like(criteriaBuilder.lower(root.get(field).as(String.class)),
                            "%" + normalizedSearchText + "%"))
                    .toList();
            criteriaQuery.where(criteriaBuilder.or(predicates.toArray(Predicate[]::new)));
        }

        var query = entityManager.createQuery(criteriaQuery);
        query.setMaxResults(resultLimit);
        return query.getResultList();
    }

    private QueryFieldDefinition findField(List<QueryFieldDefinition> fields, String path) {
        for (QueryFieldDefinition field : fields) {
            if (field.path().equals(path)) {
                return field;
            }

            QueryFieldDefinition nested = findField(field.children(), path);
            if (nested != null) {
                return nested;
            }
        }

        return null;
    }

    private String buildLabel(Object entity, List<String> labelFields) {
        List<String> values = new ArrayList<>();
        for (String labelField : labelFields) {
            Object value = extractFieldValue(entity, labelField);
            if (value != null && !value.toString().isBlank()) {
                values.add(value.toString());
            }
        }

        if (!values.isEmpty()) {
            return String.join(" · ", values);
        }

        String id = extractId(entity);
        return id == null ? "" : id;
    }

    private String extractId(Object entity) {
        Class<?> currentType = entity.getClass();
        while (currentType != null && currentType != Object.class) {
            for (Field field : currentType.getDeclaredFields()) {
                if (field.isAnnotationPresent(Id.class)) {
                    Object value = extractFieldValue(entity, field.getName());
                    return value == null ? null : String.valueOf(value);
                }
            }
            currentType = currentType.getSuperclass();
        }

        return null;
    }

    private Object extractFieldValue(Object entity, String fieldName) {
        Class<?> currentType = entity.getClass();

        while (currentType != null && currentType != Object.class) {
            try {
                Field field = currentType.getDeclaredField(fieldName);
                if (Modifier.isStatic(field.getModifiers())) {
                    return null;
                }
                field.setAccessible(true);
                return field.get(entity);
            } catch (NoSuchFieldException e) {
                currentType = currentType.getSuperclass();
            } catch (IllegalAccessException e) {
                return null;
            }
        }

        return null;
    }
}
