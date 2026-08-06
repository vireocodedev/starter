package com.vireocode.starter.queryengine;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;

public class QueryEngineMetadataGenerator {

    private final QueryEngineRegistry registry;
    private final List<QueryCustomFieldProvider> customFieldProviders;

    public QueryEngineMetadataGenerator(QueryEngineRegistry registry) {
        this(registry, List.of());
    }

    @Autowired
    public QueryEngineMetadataGenerator(QueryEngineRegistry registry,
            List<QueryCustomFieldProvider> customFieldProviders) {
        this.registry = registry;
        this.customFieldProviders = customFieldProviders;
    }

    public QueryEntityDefinition generate(String entityKey, Class<?> entityType) {
        List<QueryFieldDefinition> reflectedFields = generateFields(entityType, "", 0);
        List<QueryFieldDefinition> customFields = resolveCustomFields(entityType);

        return new QueryEntityDefinition(
                entityKey,
                resolveEntityTitle(entityType),
                entityType.getName(),
                Stream.concat(reflectedFields.stream(), customFields.stream()).toList());
    }

    private List<QueryFieldDefinition> resolveCustomFields(Class<?> entityType) {
        FilterableCustomFields metadata = entityType.getAnnotation(FilterableCustomFields.class);
        if (metadata == null) {
            return List.of();
        }

        return customFieldProviders.stream()
                .filter(metadata.value()::isInstance)
                .findFirst()
                .map(QueryCustomFieldProvider::getFields)
                .orElseGet(() -> instantiateProvider(metadata.value()).getFields());
    }

    private QueryCustomFieldProvider instantiateProvider(Class<? extends QueryCustomFieldProvider> providerType) {
        try {
            return providerType.getDeclaredConstructor().newInstance();
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException("Missing query custom field provider bean: " + providerType.getName(),
                    exception);
        }
    }

    private String resolveEntityTitle(Class<?> entityType) {
        FilterableMetadata metadata = entityType.getAnnotation(FilterableMetadata.class);
        if (metadata != null && metadata.title() != null && !metadata.title().isBlank()) {
            return metadata.title();
        }

        return entityType.getSimpleName();
    }

    private List<QueryFieldDefinition> generateFields(Class<?> entityType, String prefix, int depth) {
        List<QueryFieldDefinition> fields = new ArrayList<>();

        for (Field field : entityType.getDeclaredFields()) {
            if (!shouldInspect(field)) {
                continue;
            }

            Filterable filterable = field.getAnnotation(Filterable.class);
            if (filterable == null) {
                continue;
            }

            String path = prefix.isBlank() ? field.getName() : prefix + "." + field.getName();
            QueryFieldType type = resolveType(field);
            String enumType = resolveEnumType(field, type);
            List<String> enumValues = resolveEnumValues(field, type);
            boolean relation = type == QueryFieldType.RELATION;
            List<QueryOperator> operators = resolveOperators(filterable, type);
            RelationFilterMode relationMode = filterable.relationMode();
            String relationEntityKey = relation ? resolveRelationEntityKey(field.getType()) : null;
            List<String> relationSelectionLabelFields = resolveRelationSelectionLabelFields(field, filterable, relation,
                    path);
            List<QueryFieldDefinition> children = List.of();

            if (relation && relationMode != RelationFilterMode.SELECTION && depth < filterable.maxDepth()
                    && !isCollectionRelation(field)) {
                children = generateFields(field.getType(), path, depth + 1);
            }

            fields.add(new QueryFieldDefinition(
                    path,
                    resolveLabel(filterable.label(), field.getName()),
                    type,
                    enumType,
                    enumValues,
                    operators,
                    relation,
                    relationEntityKey,
                    relationMode,
                    filterable.multiple(),
                    relationSelectionLabelFields,
                    filterable.expand(),
                    filterable.maxDepth(),
                    children));
        }

        return fields;
    }

    private boolean shouldInspect(Field field) {
        int modifiers = field.getModifiers();
        return !Modifier.isStatic(modifiers) && !field.isSynthetic();
    }

    private boolean isCollectionRelation(Field field) {
        return Collection.class.isAssignableFrom(field.getType());
    }

    private QueryFieldType resolveType(Field field) {
        Class<?> fieldType = field.getType();

        if (isRelationField(field)) {
            return QueryFieldType.RELATION;
        }

        if (fieldType == boolean.class || fieldType == Boolean.class) {
            return QueryFieldType.BOOLEAN;
        }

        if (fieldType.isEnum()) {
            return QueryFieldType.ENUM;
        }

        if (Number.class.isAssignableFrom(fieldType)
                || fieldType == byte.class
                || fieldType == short.class
                || fieldType == int.class
                || fieldType == long.class
                || fieldType == float.class
                || fieldType == double.class
                || fieldType == BigDecimal.class) {
            return QueryFieldType.NUMBER;
        }

        if (fieldType == LocalDate.class
                || fieldType == LocalDateTime.class
                || fieldType == OffsetDateTime.class
                || fieldType == ZonedDateTime.class) {
            return QueryFieldType.DATE;
        }

        return QueryFieldType.STRING;
    }

    private boolean isRelationField(Field field) {
        return field.isAnnotationPresent(ManyToOne.class)
                || field.isAnnotationPresent(OneToOne.class)
                || field.isAnnotationPresent(OneToMany.class)
                || field.isAnnotationPresent(ManyToMany.class)
                || field.getType().isAnnotationPresent(Entity.class);
    }

    private List<QueryOperator> resolveOperators(Filterable filterable, QueryFieldType type) {
        if (filterable.operators().length > 0) {
            return List.of(filterable.operators());
        }

        return switch (type) {
            case STRING -> List.of(QueryOperator.CONTAINS, QueryOperator.EQUALS, QueryOperator.STARTS_WITH,
                    QueryOperator.ENDS_WITH, QueryOperator.IS_NULL, QueryOperator.IS_NOT_NULL);
            case NUMBER, DATE -> List.of(QueryOperator.EQUALS, QueryOperator.NOT_EQUALS, QueryOperator.GREATER_THAN,
                    QueryOperator.GREATER_OR_EQUAL, QueryOperator.LESS_THAN, QueryOperator.LESS_OR_EQUAL,
                    QueryOperator.DATE_RANGE,
                    QueryOperator.IS_NULL, QueryOperator.IS_NOT_NULL);
            case BOOLEAN -> List.of(QueryOperator.EQUALS, QueryOperator.NOT_EQUALS, QueryOperator.IS_NULL,
                    QueryOperator.IS_NOT_NULL);
            case ENUM -> filterable.multiple()
                    ? List.of(QueryOperator.IN, QueryOperator.EQUALS, QueryOperator.NOT_EQUALS, QueryOperator.IS_NULL,
                            QueryOperator.IS_NOT_NULL)
                    : List.of(QueryOperator.EQUALS, QueryOperator.NOT_EQUALS, QueryOperator.IS_NULL,
                            QueryOperator.IS_NOT_NULL);
            case RELATION -> List.of(QueryOperator.EQUALS, QueryOperator.IS_NULL, QueryOperator.IS_NOT_NULL);
        };
    }

    private String resolveEnumType(Field field, QueryFieldType type) {
        if (type != QueryFieldType.ENUM) {
            return null;
        }

        return field.getType().getSimpleName();
    }

    private List<String> resolveEnumValues(Field field, QueryFieldType type) {
        if (type != QueryFieldType.ENUM) {
            return List.of();
        }

        Object[] constants = field.getType().getEnumConstants();
        if (constants == null || constants.length == 0) {
            return List.of();
        }

        return List.of(constants).stream()
                .filter(Enum.class::isInstance)
                .map(Enum.class::cast)
                .map(Enum::name)
                .toList();
    }

    private String resolveLabel(String explicitLabel, String fieldName) {
        if (explicitLabel != null && !explicitLabel.isBlank()) {
            return explicitLabel;
        }

        return fieldName;
    }

    private String resolveRelationEntityKey(Class<?> relationType) {
        if (!relationType.isAnnotationPresent(Entity.class)) {
            return null;
        }

        return registry.requireEntityKey(relationType);
    }

    private List<String> resolveRelationSelectionLabelFields(Field field, Filterable filterable, boolean relation,
            String path) {
        if (!relation) {
            return List.of(filterable.relationSelectionLabelFields());
        }

        List<String> fromField = List.of(filterable.relationSelectionLabelFields());
        if (!fromField.isEmpty()) {
            validateRelationSelectionLabelFields(field.getType(), fromField, path, "@Filterable");
            return fromField;
        }

        FilterableMetadata metadata = field.getType().getAnnotation(FilterableMetadata.class);
        if (metadata == null || metadata.relationSelectionLabelFields().length == 0) {
            return List.of();
        }

        List<String> fromMetadata = List.of(metadata.relationSelectionLabelFields());
        validateRelationSelectionLabelFields(field.getType(), fromMetadata, path, "@FilterableMetadata");
        return fromMetadata;
    }

    private void validateRelationSelectionLabelFields(Class<?> relationType, List<String> fields, String path,
            String source) {
        for (String fieldName : fields) {
            if (fieldName == null || fieldName.isBlank() || !hasField(relationType, fieldName)) {
                throw new IllegalArgumentException("Invalid relationSelectionLabelFields value '" + fieldName
                        + "' for path '" + path + "' in " + source + ". Field does not exist on relation type "
                        + relationType.getName());
            }
        }
    }

    private boolean hasField(Class<?> type, String fieldName) {
        Class<?> current = type;
        while (current != null && current != Object.class) {
            try {
                current.getDeclaredField(fieldName);
                return true;
            } catch (NoSuchFieldException ignored) {
                current = current.getSuperclass();
            }
        }

        return false;
    }
}