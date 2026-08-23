package com.vireocode.starter.queryengine;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;

import com.vireocode.starter.spi.FilterSpecificationBuilder;
import com.vireocode.starter.spi.QueryFilterCriteria;
import com.vireocode.starter.web.RestUtils;

import jakarta.persistence.Id;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.From;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

public class QueryEngineFilterSpecificationBuilder implements FilterSpecificationBuilder {

    private final QueryEngineRegistry registry;
    private final QueryEngineMetadataGenerator metadataGenerator;
    private final List<QueryCustomFieldResolver<?>> customFieldResolvers;

    public QueryEngineFilterSpecificationBuilder(QueryEngineRegistry registry) {
        this(registry, null, List.of());
    }

    @Autowired
    public QueryEngineFilterSpecificationBuilder(QueryEngineRegistry registry,
            List<QueryCustomFieldResolver<?>> customFieldResolvers) {
        this(registry, null, customFieldResolvers);
    }

    public QueryEngineFilterSpecificationBuilder(QueryEngineRegistry registry,
            QueryEngineMetadataGenerator metadataGenerator,
            List<QueryCustomFieldResolver<?>> customFieldResolvers) {
        this.registry = registry;
        this.metadataGenerator = metadataGenerator;
        this.customFieldResolvers = List.copyOf(customFieldResolvers);
    }

    @Override
    public <DOMAIN> Specification<DOMAIN> build(Class<DOMAIN> domainType, QueryFilterCriteria criteria) {
        if (criteria != null && !(criteria instanceof QueryFilterRequest)) {
            throw new IllegalArgumentException(
                    "This builder only understands QueryFilterRequest, got " + criteria.getClass().getName());
        }

        QueryFilterRequest request = (QueryFilterRequest) criteria;
        if (request == null) {
            return (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        }

        List<QueryFilterNode> filterNodes = resolveFilterNodes(request);
        if (filterNodes.isEmpty()) {
            return (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        }

        String expectedEntity = registry.requireEntityKey(domainType);
        if (request.entity() == null || !expectedEntity.equals(request.entity())) {
            throw RestUtils.badRequest("Invalid filter entity. Expected: " + expectedEntity);
        }

        if (metadataGenerator != null) {
            QueryEntityDefinition definition = metadataGenerator.generate(expectedEntity, domainType);
            validateNodes(definition.fields(), filterNodes);
        }

        return (root, query, criteriaBuilder) -> {
            query.distinct(true);
            JoinRegistry joins = new JoinRegistry();
            List<Predicate> predicates = buildNodePredicates(root, query, criteriaBuilder, joins, filterNodes);

            if (predicates.isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private void validateNodes(List<QueryFieldDefinition> fields, List<QueryFilterNode> nodes) {
        for (QueryFilterNode node : nodes) {
            if (node == null || node.path() == null || node.path().isBlank() || node.parameterized()) {
                continue;
            }
            QueryFieldDefinition field = findField(fields, node.path());
            if (field == null) {
                throw RestUtils.badRequest("Unknown filter field: " + node.path());
            }
            if ("relation".equalsIgnoreCase(node.kind())) {
                if (!field.relation() || field.relationMode() == RelationFilterMode.CHILD) {
                    throw RestUtils.badRequest("Relation selection is not enabled for field: " + node.path());
                }
            } else if (node.operator() != null && !field.operators().contains(node.operator())) {
                throw RestUtils.badRequest("Operator " + node.operator() + " is not enabled for field: " + node.path());
            }
            validateNodes(field.children(), node.children());
        }
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

    private List<QueryFilterNode> resolveFilterNodes(QueryFilterRequest request) {
        List<QueryFilterNode> nodes = new ArrayList<>();

        if (request.rows() != null) {
            for (QueryFilterRow row : request.rows()) {
                QueryFilterNode node = mapRowToNode(row);
                if (node != null) {
                    nodes.add(node);
                }
            }
        }

        return nodes;
    }

    private QueryFilterNode mapRowToNode(QueryFilterRow row) {
        if (row == null || row.path() == null || row.path().isBlank()) {
            return null;
        }

        boolean relationRow = "relation".equalsIgnoreCase(row.kind());
        if (relationRow) {
            return new QueryFilterNode(
                    "relation",
                    row.path(),
                    null,
                    row.value(),
                    row.parameterized(),
                    row.selectedOptions() == null ? List.of() : row.selectedOptions(),
                    List.of());
        }

        return new QueryFilterNode(
                "leaf",
                row.path(),
                row.operator(),
                row.value(),
                row.parameterized(),
                List.of(),
                List.of());
    }

    private List<Predicate> buildNodePredicates(Root<?> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder,
            JoinRegistry joins, List<QueryFilterNode> nodes) {
        List<Predicate> predicates = new ArrayList<>();

        for (QueryFilterNode node : nodes) {
            Predicate current = buildNodePredicate(root, query, criteriaBuilder, joins, node);
            if (current != null) {
                predicates.add(current);
            }

            if (node.children() != null && !node.children().isEmpty()) {
                predicates.addAll(buildNodePredicates(root, query, criteriaBuilder, joins, node.children()));
            }
        }

        return predicates;
    }

    private Predicate buildNodePredicate(Root<?> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder,
            JoinRegistry joins, QueryFilterNode node) {
        if (node == null || node.path() == null || node.path().isBlank() || node.parameterized()) {
            return null;
        }

        Optional<Predicate> customPredicate = buildCustomPredicate(root, query, criteriaBuilder, node);
        if (customPredicate.isPresent()) {
            return customPredicate.get();
        }

        if ("relation".equalsIgnoreCase(node.kind())) {
            return buildRelationSelectionPredicate(root, criteriaBuilder, joins, node);
        }

        return buildLeafPredicate(root, criteriaBuilder, joins, node);
    }

    private Optional<Predicate> buildCustomPredicate(Root<?> root, CriteriaQuery<?> query,
            CriteriaBuilder criteriaBuilder, QueryFilterNode node) {
        return customFieldResolvers.stream()
                .filter(resolver -> resolver.supports().equals(root.getJavaType()))
                .filter(resolver -> resolver.fieldPath().equals(node.path()))
                .findFirst()
                .map(resolver -> buildCustomPredicate(root, query, criteriaBuilder, node, resolver));
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    private Predicate buildCustomPredicate(Root<?> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder,
            QueryFilterNode node, QueryCustomFieldResolver resolver) {
        return resolver.buildPredicate(root, query, criteriaBuilder, node);
    }

    private Predicate buildRelationSelectionPredicate(Root<?> root, CriteriaBuilder criteriaBuilder, JoinRegistry joins,
            QueryFilterNode node) {
        List<QueryFilterRelationOption> selectedOptions = node.selectedOptions();
        if (selectedOptions == null || selectedOptions.isEmpty()) {
            return null;
        }

        List<String> selectedValues = selectedOptions.stream()
                .map(QueryFilterRelationOption::value)
                .filter(value -> value != null && !value.isBlank())
                .toList();

        if (selectedValues.isEmpty()) {
            return null;
        }

        Path<?> relationPath = resolvePath(root, joins, node.path());
        Class<?> relationType = relationPath.getJavaType();
        String idFieldName = findIdFieldName(relationType);
        if (idFieldName == null) {
            throw RestUtils.badRequest("Relation field does not expose an id: " + node.path());
        }

        Path<?> relationIdPath = relationPath.get(idFieldName);
        Class<?> relationIdType = relationIdPath.getJavaType();

        List<Object> typedSelectedValues = selectedValues.stream()
                .map(value -> convertValue(relationIdType, value))
                .filter(Objects::nonNull)
                .toList();

        if (typedSelectedValues.isEmpty()) {
            return null;
        }

        return relationIdPath.in(typedSelectedValues);
    }

    private Predicate buildLeafPredicate(Root<?> root, CriteriaBuilder criteriaBuilder, JoinRegistry joins,
            QueryFilterNode node) {
        QueryOperator operator = node.operator();
        if (operator == null) {
            return null;
        }

        Path<?> path = resolvePath(root, joins, node.path());

        if (operator == QueryOperator.IS_NULL) {
            return criteriaBuilder.isNull(path);
        }

        if (operator == QueryOperator.IS_NOT_NULL) {
            return criteriaBuilder.isNotNull(path);
        }

        if (operator == QueryOperator.DATE_RANGE) {
            return buildDateRangePredicate(criteriaBuilder, path, node.value());
        }

        if (operator == QueryOperator.IN) {
            List<String> values = splitCommaSeparated(node.value());
            if (values.isEmpty()) {
                return null;
            }

            List<Object> convertedValues = values.stream()
                    .map(value -> convertValue(path.getJavaType(), value))
                    .filter(Objects::nonNull)
                    .toList();

            if (convertedValues.isEmpty()) {
                return null;
            }

            return path.in(convertedValues);
        }

        if (node.value() == null || node.value().isBlank()) {
            return null;
        }

        return switch (operator) {
            case EQUALS -> criteriaBuilder.equal(path, convertValue(path.getJavaType(), node.value()));
            case NOT_EQUALS -> criteriaBuilder.notEqual(path, convertValue(path.getJavaType(), node.value()));
            case CONTAINS -> criteriaBuilder.like(criteriaBuilder.lower(path.as(String.class)),
                    "%" + node.value().toLowerCase(Locale.ROOT) + "%");
            case STARTS_WITH -> criteriaBuilder.like(criteriaBuilder.lower(path.as(String.class)),
                    node.value().toLowerCase(Locale.ROOT) + "%");
            case ENDS_WITH -> criteriaBuilder.like(criteriaBuilder.lower(path.as(String.class)),
                    "%" + node.value().toLowerCase(Locale.ROOT));
            case GREATER_THAN ->
                buildComparablePredicate(criteriaBuilder, path, node.value(), QueryOperator.GREATER_THAN);
            case GREATER_OR_EQUAL -> buildComparablePredicate(criteriaBuilder, path, node.value(),
                    QueryOperator.GREATER_OR_EQUAL);
            case LESS_THAN -> buildComparablePredicate(criteriaBuilder, path, node.value(), QueryOperator.LESS_THAN);
            case LESS_OR_EQUAL ->
                buildComparablePredicate(criteriaBuilder, path, node.value(), QueryOperator.LESS_OR_EQUAL);
            case IN, DATE_RANGE, IS_NULL, IS_NOT_NULL -> null;
        };
    }

    private Predicate buildComparablePredicate(CriteriaBuilder criteriaBuilder, Path<?> path, String rawValue,
            QueryOperator operator) {
        Class<?> javaType = path.getJavaType();
        if (Comparable.class.isAssignableFrom(javaType)) {
            @SuppressWarnings("unchecked")
            Expression<? extends Comparable<Object>> comparablePath = (Expression<? extends Comparable<Object>>) path;
            Comparable<Object> comparableValue = toComparable(javaType, rawValue);

            if (comparableValue == null) {
                return null;
            }

            return switch (operator) {
                case GREATER_THAN -> criteriaBuilder.greaterThan(comparablePath, comparableValue);
                case GREATER_OR_EQUAL -> criteriaBuilder.greaterThanOrEqualTo(comparablePath, comparableValue);
                case LESS_THAN -> criteriaBuilder.lessThan(comparablePath, comparableValue);
                case LESS_OR_EQUAL -> criteriaBuilder.lessThanOrEqualTo(comparablePath, comparableValue);
                default -> null;
            };
        }

        return null;
    }

    private Predicate buildDateRangePredicate(CriteriaBuilder criteriaBuilder, Path<?> path, String value) {
        if (value == null) {
            return null;
        }

        String[] parts = value.split("\\|", -1);
        String fromRaw = parts.length > 0 ? parts[0].trim() : "";
        String toRaw = parts.length > 1 ? parts[1].trim() : "";

        List<Predicate> predicates = new ArrayList<>();

        if (!fromRaw.isBlank()) {
            Predicate fromPredicate = buildComparablePredicate(criteriaBuilder, path, fromRaw,
                    QueryOperator.GREATER_OR_EQUAL);
            if (fromPredicate != null) {
                predicates.add(fromPredicate);
            }
        }

        if (!toRaw.isBlank()) {
            Predicate toPredicate = buildComparablePredicate(criteriaBuilder, path, toRaw, QueryOperator.LESS_OR_EQUAL);
            if (toPredicate != null) {
                predicates.add(toPredicate);
            }
        }

        if (predicates.isEmpty()) {
            return null;
        }

        return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
    }

    private List<String> splitCommaSeparated(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }

        return List.of(value.split(",")).stream()
                .map(String::trim)
                .filter(part -> !part.isBlank())
                .toList();
    }

    private Object convertValue(Class<?> javaType, String value) {
        if (value == null) {
            return null;
        }

        try {
            if (javaType == String.class) {
                return value;
            }

            if (javaType == boolean.class || javaType == Boolean.class) {
                return Boolean.parseBoolean(value);
            }

            if (javaType == int.class || javaType == Integer.class) {
                return Integer.parseInt(value);
            }

            if (javaType == long.class || javaType == Long.class) {
                return Long.parseLong(value);
            }

            if (javaType == short.class || javaType == Short.class) {
                return Short.parseShort(value);
            }

            if (javaType == double.class || javaType == Double.class) {
                return Double.parseDouble(value);
            }

            if (javaType == float.class || javaType == Float.class) {
                return Float.parseFloat(value);
            }

            if (javaType == BigDecimal.class) {
                return new BigDecimal(value);
            }

            if (javaType == LocalDate.class) {
                return LocalDate.parse(value);
            }

            if (javaType == LocalDateTime.class) {
                return LocalDateTime.parse(value);
            }

            if (javaType == OffsetDateTime.class) {
                return OffsetDateTime.parse(value);
            }

            if (javaType == ZonedDateTime.class) {
                return ZonedDateTime.parse(value);
            }

            if (javaType.isEnum()) {
                @SuppressWarnings({ "unchecked", "rawtypes" })
                Object enumValue = Enum.valueOf((Class<? extends Enum>) javaType, value);
                return enumValue;
            }

            return value;
        } catch (RuntimeException ex) {
            throw RestUtils.badRequest("Invalid filter value '" + value + "' for type " + javaType.getSimpleName());
        }
    }

    private Comparable<Object> toComparable(Class<?> javaType, String value) {
        Object converted = convertValue(javaType, value);
        if (converted instanceof Comparable<?> comparable) {
            @SuppressWarnings("unchecked")
            Comparable<Object> casted = (Comparable<Object>) comparable;
            return casted;
        }

        return null;
    }

    private Path<?> resolvePath(Root<?> root, JoinRegistry joins, String path) {
        String[] segments = path.split("\\.");
        if (segments.length == 0) {
            throw RestUtils.badRequest("Invalid filter path: " + path);
        }

        From<?, ?> current = root;
        for (int index = 0; index < segments.length - 1; index++) {
            String joinPath = String.join(".", List.of(segments).subList(0, index + 1));
            current = joins.getOrCreate(current, joinPath, segments[index]);
        }

        return current.get(segments[segments.length - 1]);
    }

    private String findIdFieldName(Class<?> type) {
        Class<?> currentType = type;
        while (currentType != null && currentType != Object.class) {
            for (Field field : currentType.getDeclaredFields()) {
                if (Modifier.isStatic(field.getModifiers())) {
                    continue;
                }

                if (field.isAnnotationPresent(Id.class)) {
                    return field.getName();
                }
            }

            currentType = currentType.getSuperclass();
        }

        return null;
    }

    private static final class JoinRegistry {
        private final Map<String, Join<?, ?>> joinsByPath = new HashMap<>();

        private From<?, ?> getOrCreate(From<?, ?> current, String joinPath, String fieldName) {
            return joinsByPath.computeIfAbsent(joinPath, ignored -> current.join(fieldName, JoinType.LEFT));
        }
    }
}
