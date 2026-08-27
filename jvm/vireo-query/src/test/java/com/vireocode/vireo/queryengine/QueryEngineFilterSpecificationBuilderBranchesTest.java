package com.vireocode.vireo.queryengine;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.SuppressWarnings;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import jakarta.persistence.Id;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

class QueryEngineFilterSpecificationBuilderBranchesTest {

    @Test
    void build_ThrowsWhenEntityIsMissingEvenWithRows() {
        QueryEngineRegistry registry = mock(QueryEngineRegistry.class);
        when(registry.requireEntityKey(TestEntity.class)).thenReturn("WIDGET");
        QueryEngineFilterSpecificationBuilder builder = new QueryEngineFilterSpecificationBuilder(registry);

        QueryFilterRequest request = new QueryFilterRequest(null, "x",
                List.of(new QueryFilterRow("leaf", "age", QueryOperator.EQUALS, "1", false, List.of())));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> builder.build(TestEntity.class, request));
        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void buildNodePredicate_ReturnsNullForGuardClausesAndUsesCustomResolver() throws Exception {
        QueryEngineRegistry registry = mock(QueryEngineRegistry.class);
        QueryCustomFieldResolver<TestEntity> resolver = mockResolver();
        QueryEngineFilterSpecificationBuilder builder = new QueryEngineFilterSpecificationBuilder(registry,
                List.of(resolver));

        @SuppressWarnings("unchecked")
        Root<TestEntity> root = mock(Root.class);
        CriteriaQuery<?> query = mock(CriteriaQuery.class);
        CriteriaBuilder criteriaBuilder = mock(CriteriaBuilder.class);
        Object joins = newJoinRegistry();

        QueryFilterNode nullPath = new QueryFilterNode("leaf", " ", QueryOperator.EQUALS, "x", false, List.of(),
                List.of());
        assertNull(invoke(builder, "buildNodePredicate",
                new Class<?>[] { Root.class, CriteriaQuery.class, CriteriaBuilder.class, joins.getClass(),
                        QueryFilterNode.class },
                root, query, criteriaBuilder, joins, nullPath));

        QueryFilterNode parameterized = new QueryFilterNode("leaf", "age", QueryOperator.EQUALS, "x", true,
                List.of(), List.of());
        assertNull(invoke(builder, "buildNodePredicate",
                new Class<?>[] { Root.class, CriteriaQuery.class, CriteriaBuilder.class, joins.getClass(),
                        QueryFilterNode.class },
                root, query, criteriaBuilder, joins, parameterized));

        Predicate customPredicate = mock(Predicate.class);
        doReturn(TestEntity.class).when(root).getJavaType();
        when(resolver.supports()).thenReturn(TestEntity.class);
        when(resolver.fieldPath()).thenReturn("customField");
        when(resolver.buildPredicate(any(), any(), any(), any())).thenReturn(customPredicate);

        QueryFilterNode custom = new QueryFilterNode("leaf", "customField", QueryOperator.EQUALS, "x", false,
                List.of(), List.of());

        Object result = invoke(builder, "buildNodePredicate",
                new Class<?>[] { Root.class, CriteriaQuery.class, CriteriaBuilder.class, joins.getClass(),
                        QueryFilterNode.class },
                root, query, criteriaBuilder, joins, custom);

        assertSame(customPredicate, result);
    }

    @Test
    void buildRelationSelectionPredicate_CoversNullBlankThrowAndSuccessBranches() throws Exception {
        QueryEngineFilterSpecificationBuilder builder = new QueryEngineFilterSpecificationBuilder(mock(QueryEngineRegistry.class));

        @SuppressWarnings("unchecked")
        Root<TestEntity> root = mock(Root.class);
        CriteriaBuilder criteriaBuilder = mock(CriteriaBuilder.class);
        Object joins = newJoinRegistry();

        QueryFilterNode noOptions = new QueryFilterNode("relation", "relation", null, null, false, null, List.of());
        assertNull(invoke(builder, "buildRelationSelectionPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class },
                root, criteriaBuilder, joins, noOptions));

        QueryFilterNode blankOptions = new QueryFilterNode("relation", "relation", null, null, false,
                List.of(new QueryFilterRelationOption(" ", " ")), List.of());
        assertNull(invoke(builder, "buildRelationSelectionPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class },
                root, criteriaBuilder, joins, blankOptions));

        @SuppressWarnings("unchecked")
        Path<Object> relationPathWithoutId = mock(Path.class);
        when(root.get("relationNoId")).thenReturn(relationPathWithoutId);
        doReturn(RelationWithoutId.class).when(relationPathWithoutId).getJavaType();

        QueryFilterNode missingId = new QueryFilterNode("relation", "relationNoId", null, null, false,
                List.of(new QueryFilterRelationOption("1", "one")), List.of());

        assertThrows(ResponseStatusException.class, () -> invoke(builder, "buildRelationSelectionPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class },
                root, criteriaBuilder, joins, missingId));

        @SuppressWarnings("unchecked")
        Path<Object> relationPath = mock(Path.class);
        @SuppressWarnings("unchecked")
        Path<Object> relationIdPath = mock(Path.class);
        Predicate inPredicate = mock(Predicate.class);

        when(root.get("relation")).thenReturn(relationPath);
        doReturn(RelationWithId.class).when(relationPath).getJavaType();
        when(relationPath.get("id")).thenReturn(relationIdPath);
        doReturn(Long.class).when(relationIdPath).getJavaType();
        when(relationIdPath.in(any(List.class))).thenReturn(inPredicate);

        QueryFilterNode ok = new QueryFilterNode("relation", "relation", null, null, false,
                List.of(new QueryFilterRelationOption("12", "twelve")), List.of());

        Object result = invoke(builder, "buildRelationSelectionPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class },
                root, criteriaBuilder, joins, ok);

        assertSame(inPredicate, result);
    }

    @Test
    void buildLeafPredicate_CoversNullAndStringOperators() throws Exception {
        QueryEngineFilterSpecificationBuilder builder = new QueryEngineFilterSpecificationBuilder(mock(QueryEngineRegistry.class));
        @SuppressWarnings("unchecked")
        Root<TestEntity> root = mock(Root.class);
        CriteriaBuilder criteriaBuilder = mock(CriteriaBuilder.class);
        Object joins = newJoinRegistry();

        @SuppressWarnings("unchecked")
        Path<Object> path = mock(Path.class);
        @SuppressWarnings("unchecked")
        Expression<String> asString = mock(Expression.class);
        @SuppressWarnings("unchecked")
        Expression<String> lowered = mock(Expression.class);
        Predicate p1 = mock(Predicate.class);
        Predicate p2 = mock(Predicate.class);
        Predicate p3 = mock(Predicate.class);
        Predicate p4 = mock(Predicate.class);
        Predicate p5 = mock(Predicate.class);

        when(root.get("name")).thenReturn(path);
        doReturn(String.class).when(path).getJavaType();
        when(path.as(String.class)).thenReturn(asString);
        when(criteriaBuilder.lower(asString)).thenReturn(lowered);
        when(criteriaBuilder.like(any(Expression.class), anyString())).thenReturn(p1, p2, p3);
        when(criteriaBuilder.equal(path, "x")).thenReturn(p4);
        when(criteriaBuilder.notEqual(path, "x")).thenReturn(p5);

        QueryFilterNode noOperator = new QueryFilterNode("leaf", "name", null, "x", false, List.of(), List.of());
        assertNull(invoke(builder, "buildLeafPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class },
                root, criteriaBuilder, joins, noOperator));

        QueryFilterNode blankValue = new QueryFilterNode("leaf", "name", QueryOperator.EQUALS, " ", false, List.of(),
                List.of());
        assertNull(invoke(builder, "buildLeafPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class },
                root, criteriaBuilder, joins, blankValue));

        QueryFilterNode equals = new QueryFilterNode("leaf", "name", QueryOperator.EQUALS, "x", false, List.of(),
                List.of());
        QueryFilterNode notEquals = new QueryFilterNode("leaf", "name", QueryOperator.NOT_EQUALS, "x", false,
                List.of(), List.of());
        QueryFilterNode contains = new QueryFilterNode("leaf", "name", QueryOperator.CONTAINS, "x", false,
                List.of(), List.of());
        QueryFilterNode starts = new QueryFilterNode("leaf", "name", QueryOperator.STARTS_WITH, "x", false,
                List.of(), List.of());
        QueryFilterNode ends = new QueryFilterNode("leaf", "name", QueryOperator.ENDS_WITH, "x", false,
                List.of(), List.of());

        assertSame(p4, invoke(builder, "buildLeafPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class }, root,
                criteriaBuilder, joins, equals));
        assertSame(p5, invoke(builder, "buildLeafPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class }, root,
                criteriaBuilder, joins, notEquals));
        assertSame(p1, invoke(builder, "buildLeafPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class }, root,
                criteriaBuilder, joins, contains));
        assertSame(p2, invoke(builder, "buildLeafPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class }, root,
                criteriaBuilder, joins, starts));
        assertSame(p3, invoke(builder, "buildLeafPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class }, root,
                criteriaBuilder, joins, ends));
    }

    @Test
    void buildLeafPredicate_CoversInDateRangeNullChecksAndComparableOperators() throws Exception {
        QueryEngineFilterSpecificationBuilder builder = new QueryEngineFilterSpecificationBuilder(mock(QueryEngineRegistry.class));
        @SuppressWarnings("unchecked")
        Root<TestEntity> root = mock(Root.class);
        CriteriaBuilder criteriaBuilder = mock(CriteriaBuilder.class);
        Object joins = newJoinRegistry();

        @SuppressWarnings("unchecked")
        Path<Object> path = mock(Path.class);
        when(root.get("age")).thenReturn(path);
        doReturn(Integer.class).when(path).getJavaType();

        Predicate inPredicate = mock(Predicate.class);
        Predicate gt = mock(Predicate.class);
        Predicate ge = mock(Predicate.class);
        Predicate lt = mock(Predicate.class);
        Predicate le = mock(Predicate.class);
        Predicate andPredicate = mock(Predicate.class);

        when(path.in(any(List.class))).thenReturn(inPredicate);

        when(criteriaBuilder.greaterThan(any(Expression.class), any(Comparable.class))).thenReturn(gt);
        when(criteriaBuilder.greaterThanOrEqualTo(any(Expression.class), any(Comparable.class))).thenReturn(ge);
        when(criteriaBuilder.lessThan(any(Expression.class), any(Comparable.class))).thenReturn(lt);
        when(criteriaBuilder.lessThanOrEqualTo(any(Expression.class), any(Comparable.class))).thenReturn(le);
        when(criteriaBuilder.and(any(Predicate[].class))).thenReturn(andPredicate);

        QueryFilterNode inBlank = new QueryFilterNode("leaf", "age", QueryOperator.IN, " ", false, List.of(),
                List.of());
        assertNull(invoke(builder, "buildLeafPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class }, root,
                criteriaBuilder, joins, inBlank));

        QueryFilterNode in = new QueryFilterNode("leaf", "age", QueryOperator.IN, "1,2", false, List.of(),
                List.of());
        assertSame(inPredicate, invoke(builder, "buildLeafPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class }, root,
                criteriaBuilder, joins, in));

        QueryFilterNode dateRangeNull = new QueryFilterNode("leaf", "age", QueryOperator.DATE_RANGE, null, false,
                List.of(), List.of());
        assertNull(invoke(builder, "buildLeafPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class }, root,
                criteriaBuilder, joins, dateRangeNull));

        QueryFilterNode dateRangeBlank = new QueryFilterNode("leaf", "age", QueryOperator.DATE_RANGE, "|", false,
                List.of(), List.of());
        assertNull(invoke(builder, "buildLeafPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class }, root,
                criteriaBuilder, joins, dateRangeBlank));

        QueryFilterNode dateRange = new QueryFilterNode("leaf", "age", QueryOperator.DATE_RANGE, "1|3", false,
                List.of(), List.of());
        assertSame(andPredicate, invoke(builder, "buildLeafPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class }, root,
                criteriaBuilder, joins, dateRange));

        QueryFilterNode greaterThan = new QueryFilterNode("leaf", "age", QueryOperator.GREATER_THAN, "1", false,
                List.of(), List.of());
        QueryFilterNode greaterOrEqual = new QueryFilterNode("leaf", "age", QueryOperator.GREATER_OR_EQUAL, "1",
                false, List.of(), List.of());
        QueryFilterNode lessThan = new QueryFilterNode("leaf", "age", QueryOperator.LESS_THAN, "1", false,
                List.of(), List.of());
        QueryFilterNode lessOrEqual = new QueryFilterNode("leaf", "age", QueryOperator.LESS_OR_EQUAL, "1", false,
                List.of(), List.of());

        assertSame(gt, invoke(builder, "buildLeafPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class }, root,
                criteriaBuilder, joins, greaterThan));
        assertSame(ge, invoke(builder, "buildLeafPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class }, root,
                criteriaBuilder, joins, greaterOrEqual));
        assertSame(lt, invoke(builder, "buildLeafPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class }, root,
                criteriaBuilder, joins, lessThan));
        assertSame(le, invoke(builder, "buildLeafPredicate",
                new Class<?>[] { Root.class, CriteriaBuilder.class, joins.getClass(), QueryFilterNode.class }, root,
                criteriaBuilder, joins, lessOrEqual));

        when(root.get("createdAt")).thenReturn(path);
        doReturn(LocalDate.class).when(path).getJavaType();
    }

    @SuppressWarnings("unchecked")
    private static QueryCustomFieldResolver<TestEntity> mockResolver() {
        return mock(QueryCustomFieldResolver.class);
    }

    private static Object newJoinRegistry() throws Exception {
        Class<?> joinRegistryClass = Class
                .forName("com.vireocode.vireo.queryengine.QueryEngineFilterSpecificationBuilder$JoinRegistry");
        Constructor<?> constructor = joinRegistryClass.getDeclaredConstructor();
        constructor.setAccessible(true);
        return constructor.newInstance();
    }

    @SuppressWarnings("unchecked")
    private static <T> T invoke(Object target, String methodName, Class<?>[] types, Object... args) throws Exception {
        Method method = target.getClass().getDeclaredMethod(methodName, types);
        method.setAccessible(true);
        try {
            return (T) method.invoke(target, args);
        } catch (java.lang.reflect.InvocationTargetException ex) {
            if (ex.getCause() instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }
            throw ex;
        }
    }

    static class TestEntity {
        @Id
        private Long id;
    }

    static class RelationWithId {
        @Id
        private Long id;
    }

    static class RelationWithoutId {
                @SuppressWarnings("unused")
        private String code;
    }
}
