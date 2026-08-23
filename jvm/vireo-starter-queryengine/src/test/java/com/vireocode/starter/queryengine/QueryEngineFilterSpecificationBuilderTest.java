package com.vireocode.starter.queryengine;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.server.ResponseStatusException;

import jakarta.persistence.Id;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

class QueryEngineFilterSpecificationBuilderTest {

    @Test
    void build_ReturnsConjunctionForNullRequestAndEmptyRows() {
        QueryEngineRegistry registry = mock(QueryEngineRegistry.class);
        QueryEngineFilterSpecificationBuilder builder = new QueryEngineFilterSpecificationBuilder(registry);

        @SuppressWarnings("unchecked")
        Root<TestEntity> root = mock(Root.class);
        @SuppressWarnings("unchecked")
        CriteriaQuery<Object> query = mock(CriteriaQuery.class);
        CriteriaBuilder criteriaBuilder = mock(CriteriaBuilder.class);
        Predicate conjunction = mock(Predicate.class);
        when(criteriaBuilder.conjunction()).thenReturn(conjunction);

        Specification<TestEntity> nullRequestSpec = builder.build(TestEntity.class, null);
        assertEquals(conjunction, nullRequestSpec.toPredicate(root, query, criteriaBuilder));

        QueryFilterRequest empty = new QueryFilterRequest("X", "T", List.of());
        Specification<TestEntity> emptySpec = builder.build(TestEntity.class, empty);
        assertEquals(conjunction, emptySpec.toPredicate(root, query, criteriaBuilder));
    }

    @Test
    void build_ThrowsForEntityMismatch() {
        QueryEngineRegistry registry = mock(QueryEngineRegistry.class);
        QueryEngineFilterSpecificationBuilder builder = new QueryEngineFilterSpecificationBuilder(registry);

        when(registry.requireEntityKey(TestEntity.class)).thenReturn("WIDGET");

        QueryFilterRow row = new QueryFilterRow("leaf", "name", QueryOperator.EQUALS, "a", false, List.of());
        QueryFilterRequest request = new QueryFilterRequest("ORDER", "X", List.of(row));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> builder.build(TestEntity.class, request));
        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void build_WithParameterizedRowProducesConjunction() {
        QueryEngineRegistry registry = mock(QueryEngineRegistry.class);
        QueryEngineFilterSpecificationBuilder builder = new QueryEngineFilterSpecificationBuilder(registry);

        when(registry.requireEntityKey(TestEntity.class)).thenReturn("ENTITY");

        QueryFilterRow row = new QueryFilterRow("leaf", "name", QueryOperator.EQUALS, "a", true, List.of());
        QueryFilterRequest request = new QueryFilterRequest("ENTITY", "X", List.of(row));

        @SuppressWarnings("unchecked")
        Root<TestEntity> root = mock(Root.class);
        @SuppressWarnings("unchecked")
        CriteriaQuery<Object> query = mock(CriteriaQuery.class);
        CriteriaBuilder criteriaBuilder = mock(CriteriaBuilder.class);
        Predicate conjunction = mock(Predicate.class);
        when(criteriaBuilder.conjunction()).thenReturn(conjunction);
        when(query.distinct(true)).thenReturn(query);

        Specification<TestEntity> specification = builder.build(TestEntity.class, request);
        assertEquals(conjunction, specification.toPredicate(root, query, criteriaBuilder));
    }

    @Test
    void build_RejectsPathsAndOperatorsOutsideGeneratedMetadata() {
        QueryEngineRegistry registry = mock(QueryEngineRegistry.class);
        QueryEngineMetadataGenerator generator = mock(QueryEngineMetadataGenerator.class);
        QueryFieldDefinition name = new QueryFieldDefinition(
                "name", "Name", QueryFieldType.STRING, null, List.of(), List.of(QueryOperator.CONTAINS), false,
                null, RelationFilterMode.CHILD, false, List.of(), false, 0, List.of());
        when(registry.requireEntityKey(TestEntity.class)).thenReturn("ENTITY");
        when(generator.generate("ENTITY", TestEntity.class)).thenReturn(
                new QueryEntityDefinition("ENTITY", "Entity", TestEntity.class.getName(), List.of(name)));
        QueryEngineFilterSpecificationBuilder builder = new QueryEngineFilterSpecificationBuilder(
                registry, generator, List.of());

        QueryFilterRequest unknownPath = new QueryFilterRequest("ENTITY", null,
                List.of(new QueryFilterRow("leaf", "secret", QueryOperator.EQUALS, "x", false, List.of())));
        QueryFilterRequest forbiddenOperator = new QueryFilterRequest("ENTITY", null,
                List.of(new QueryFilterRow("leaf", "name", QueryOperator.GREATER_THAN, "x", false, List.of())));

        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> builder.build(TestEntity.class, unknownPath)).getStatusCode().value());
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> builder.build(TestEntity.class, forbiddenOperator)).getStatusCode().value());
    }

    @Test
    void convertValue_CoversSupportedTypesAndFallback() throws Exception {
        QueryEngineFilterSpecificationBuilder builder = new QueryEngineFilterSpecificationBuilder(mock(QueryEngineRegistry.class));

        assertEquals("x", invoke(builder, "convertValue", new Class<?>[] { Class.class, String.class }, String.class, "x"));
        assertEquals(true, invoke(builder, "convertValue", new Class<?>[] { Class.class, String.class }, Boolean.class, "true"));
        assertEquals(Integer.valueOf(7), invoke(builder, "convertValue", new Class<?>[] { Class.class, String.class }, Integer.class, "7"));
        assertEquals(Long.valueOf(9L), invoke(builder, "convertValue", new Class<?>[] { Class.class, String.class }, Long.class, "9"));
        assertEquals(Short.valueOf((short) 3), invoke(builder, "convertValue", new Class<?>[] { Class.class, String.class }, Short.class, "3"));
        assertEquals(2.5d, invoke(builder, "convertValue", new Class<?>[] { Class.class, String.class }, Double.class, "2.5"));
        assertEquals(Float.valueOf(4.5f), invoke(builder, "convertValue", new Class<?>[] { Class.class, String.class }, Float.class, "4.5"));
        assertEquals(new BigDecimal("1.25"), invoke(builder, "convertValue", new Class<?>[] { Class.class, String.class }, BigDecimal.class, "1.25"));
        assertEquals(LocalDate.parse("2026-07-23"), invoke(builder, "convertValue", new Class<?>[] { Class.class, String.class }, LocalDate.class, "2026-07-23"));
        assertEquals(LocalDateTime.parse("2026-07-23T10:15:30"), invoke(builder, "convertValue", new Class<?>[] { Class.class, String.class }, LocalDateTime.class, "2026-07-23T10:15:30"));
        assertEquals(OffsetDateTime.parse("2026-07-23T10:15:30+01:00"), invoke(builder, "convertValue", new Class<?>[] { Class.class, String.class }, OffsetDateTime.class, "2026-07-23T10:15:30+01:00"));
        assertEquals(ZonedDateTime.parse("2026-07-23T10:15:30+01:00[Europe/Paris]"), invoke(builder, "convertValue", new Class<?>[] { Class.class, String.class }, ZonedDateTime.class, "2026-07-23T10:15:30+01:00[Europe/Paris]"));
        assertEquals(TestEnum.A, invoke(builder, "convertValue", new Class<?>[] { Class.class, String.class }, TestEnum.class, "A"));
        assertEquals("fallback", invoke(builder, "convertValue", new Class<?>[] { Class.class, String.class }, Object.class, "fallback"));
    }

    @Test
    void convertValue_InvalidTypedInputThrowsBadRequest() throws Exception {
        QueryEngineFilterSpecificationBuilder builder = new QueryEngineFilterSpecificationBuilder(mock(QueryEngineRegistry.class));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                invoke(builder, "convertValue", new Class<?>[] { Class.class, String.class }, Integer.class, "oops"));

        assertEquals(400, exception.getStatusCode().value());
    }

    @Test
    void splitCommaSeparated_HandlesNullBlankAndTrimmedValues() throws Exception {
        QueryEngineFilterSpecificationBuilder builder = new QueryEngineFilterSpecificationBuilder(mock(QueryEngineRegistry.class));

        assertEquals(List.of(), invoke(builder, "splitCommaSeparated", new Class<?>[] { String.class }, (String) null));
        assertEquals(List.of(), invoke(builder, "splitCommaSeparated", new Class<?>[] { String.class }, "   "));
        assertEquals(List.of("a", "b", "c"), invoke(builder, "splitCommaSeparated", new Class<?>[] { String.class }, " a, b ,, c "));
    }

    @Test
    void findIdFieldName_ResolvesIdAcrossHierarchyOrReturnsNull() throws Exception {
        QueryEngineFilterSpecificationBuilder builder = new QueryEngineFilterSpecificationBuilder(mock(QueryEngineRegistry.class));

        assertEquals("id", invoke(builder, "findIdFieldName", new Class<?>[] { Class.class }, ChildWithId.class));
        assertNull(invoke(builder, "findIdFieldName", new Class<?>[] { Class.class }, NoId.class));
    }

    @Test
    void buildComparablePredicate_ReturnsNullWhenPathNotComparable() throws Exception {
        QueryEngineFilterSpecificationBuilder builder = new QueryEngineFilterSpecificationBuilder(mock(QueryEngineRegistry.class));

        CriteriaBuilder criteriaBuilder = mock(CriteriaBuilder.class);
        @SuppressWarnings("unchecked")
        Path<Object> path = mock(Path.class);
        doReturn(NonComparable.class).when(path).getJavaType();

        Object predicate = invoke(builder, "buildComparablePredicate",
                new Class<?>[] { CriteriaBuilder.class, Path.class, String.class, QueryOperator.class },
                criteriaBuilder, path, "x", QueryOperator.GREATER_THAN);

        assertNull(predicate);
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

    enum TestEnum {
        A,
        B
    }

    static class TestEntity {
        @Id
        private Long id;
    }

    static class ParentWithId {
        @Id
        private Long id;
    }

    static class ChildWithId extends ParentWithId {
        @SuppressWarnings("unused")
        private String value;
    }

    static class NoId {
        @SuppressWarnings("unused")
        private String value;
    }

    static class NonComparable {
        private final String value;

        NonComparable(String value) {
            this.value = value;
        }

        String getValue() {
            return value;
        }
    }
}
