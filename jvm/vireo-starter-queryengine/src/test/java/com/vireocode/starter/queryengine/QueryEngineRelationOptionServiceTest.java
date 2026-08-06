package com.vireocode.starter.queryengine;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Id;
import jakarta.persistence.TypedQuery;

class QueryEngineRelationOptionServiceTest {

    @Test
    void listOptions_ThrowsWhenRelationFieldMissing() {
        QueryEngineRegistry registry = mock(QueryEngineRegistry.class);
        QueryEngineMetadataGenerator generator = mock(QueryEngineMetadataGenerator.class);
        QueryEngineRelationOptionService service = new QueryEngineRelationOptionService(registry, generator);

        QueryEntityDefinition definition = new QueryEntityDefinition("WIDGET", "Widget", Widget.class.getName(), List.of());
        doReturn(Widget.class).when(registry).requireEntityType("WIDGET");
        when(generator.generate("WIDGET", Widget.class)).thenReturn(definition);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> service.listOptions("WIDGET", "category", ""));
        assertEquals("Unknown relation field: category", exception.getMessage());
    }

    @Test
    void listOptions_ThrowsWhenSelectionDisabled() {
        QueryEngineRegistry registry = mock(QueryEngineRegistry.class);
        QueryEngineMetadataGenerator generator = mock(QueryEngineMetadataGenerator.class);
        QueryEngineRelationOptionService service = new QueryEngineRelationOptionService(registry, generator);

        QueryFieldDefinition relationField = new QueryFieldDefinition(
                "category", "category", QueryFieldType.RELATION, null, List.of(), List.of(), true,
                "CATEGORY", RelationFilterMode.CHILD, false, List.of("name"), true, 1, List.of());
        QueryEntityDefinition definition = new QueryEntityDefinition("WIDGET", "Widget", Widget.class.getName(),
                List.of(relationField));

        doReturn(Widget.class).when(registry).requireEntityType("WIDGET");
        when(generator.generate("WIDGET", Widget.class)).thenReturn(definition);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> service.listOptions("WIDGET", "category", ""));
        assertEquals("Relation selection is not enabled for field: category", exception.getMessage());
    }

    @Test
    void listOptions_BlankSearchBuildsSortedLabelsWithoutSearchParam() throws Exception {
        QueryEngineRegistry registry = mock(QueryEngineRegistry.class);
        QueryEngineMetadataGenerator generator = mock(QueryEngineMetadataGenerator.class);
        QueryEngineRelationOptionService service = new QueryEngineRelationOptionService(registry, generator);

        EntityManager entityManager = mock(EntityManager.class);
        @SuppressWarnings("unchecked")
        TypedQuery<Category> query = mock(TypedQuery.class);
        setEntityManager(service, entityManager);

        QueryFieldDefinition relationField = new QueryFieldDefinition(
                "category", "category", QueryFieldType.RELATION, null, List.of(), List.of(), true,
                "CATEGORY", RelationFilterMode.SELECTION, false, List.of("name", "code"), true, 1, List.of());
        QueryEntityDefinition definition = new QueryEntityDefinition("WIDGET", "Widget", Widget.class.getName(),
                List.of(relationField));

        doReturn(Widget.class).when(registry).requireEntityType("WIDGET");
        when(generator.generate("WIDGET", Widget.class)).thenReturn(definition);
        doReturn(Category.class).when(registry).requireEntityType("CATEGORY");

        when(entityManager.createQuery(
                eq("select e from Category e where e.deleted = false order by e.createdAt desc"), eq(Category.class)))
                .thenReturn(query);
        when(query.setMaxResults(anyInt())).thenReturn(query);

        Category c1 = new Category(2L, "bravo", "BR");
        Category c2 = new Category(1L, "Alpha", "AL");
        when(query.getResultList()).thenReturn(List.of(c1, c2));

        List<QueryRelationOption> result = service.listOptions("WIDGET", "category", "   ");

        assertEquals(2, result.size());
        assertEquals("1", result.get(0).value());
        assertEquals("Alpha · AL", result.get(0).label());
        assertEquals("2", result.get(1).value());
        assertEquals("bravo · BR", result.get(1).label());
        verify(query, never()).setParameter(eq("searchText"), eq("%alpha%"));
    }

    @Test
    void listOptions_NonBlankSearchAddsLikeParameter() throws Exception {
        QueryEngineRegistry registry = mock(QueryEngineRegistry.class);
        QueryEngineMetadataGenerator generator = mock(QueryEngineMetadataGenerator.class);
        QueryEngineRelationOptionService service = new QueryEngineRelationOptionService(registry, generator);

        EntityManager entityManager = mock(EntityManager.class);
        @SuppressWarnings("unchecked")
        TypedQuery<CategoryNoLabel> query = mock(TypedQuery.class);
        setEntityManager(service, entityManager);

        QueryFieldDefinition relationField = new QueryFieldDefinition(
                "category", "category", QueryFieldType.RELATION, null, List.of(), List.of(), true,
                "CATEGORY", RelationFilterMode.SELECTION, false, List.of("missingLabel"), true, 1, List.of());
        QueryEntityDefinition definition = new QueryEntityDefinition("WIDGET", "Widget", Widget.class.getName(),
                List.of(relationField));

        doReturn(Widget.class).when(registry).requireEntityType("WIDGET");
        when(generator.generate("WIDGET", Widget.class)).thenReturn(definition);
        doReturn(CategoryNoLabel.class).when(registry).requireEntityType("CATEGORY");

        when(entityManager.createQuery(
                eq("select e from CategoryNoLabel e where e.deleted = false and lower(e.keywords) like :searchText order by e.createdAt desc"),
                eq(CategoryNoLabel.class)))
                .thenReturn(query);
        when(query.setParameter(eq("searchText"), eq("%test%"))).thenReturn(query);
        when(query.setMaxResults(anyInt())).thenReturn(query);

        when(query.getResultList()).thenReturn(List.of(new CategoryNoLabel(9L), new CategoryNoLabel(null)));

        List<QueryRelationOption> result = service.listOptions("WIDGET", "category", "  TeSt  ");

        assertEquals(2, result.size());
                assertEquals("", result.get(0).label());
                assertEquals("9", result.get(1).label());
        verify(query).setParameter("searchText", "%test%");
    }

    @Test
    void privateHelpers_CoverFindFieldBuildLabelAndExtractors() throws Exception {
        QueryEngineRelationOptionService service = new QueryEngineRelationOptionService(mock(QueryEngineRegistry.class),
                mock(QueryEngineMetadataGenerator.class));

        QueryFieldDefinition child = new QueryFieldDefinition("nested.child", "child", QueryFieldType.STRING, null,
                List.of(), List.of(), false, null, RelationFilterMode.CHILD, false, List.of(), false, 0, List.of());
        QueryFieldDefinition parent = new QueryFieldDefinition("nested", "nested", QueryFieldType.RELATION, null,
                List.of(), List.of(), true, "X", RelationFilterMode.BOTH, false, List.of(), true, 1, List.of(child));

        QueryFieldDefinition found = invoke(service, "findField", new Class<?>[] { List.class, String.class },
                List.of(parent), "nested.child");
        QueryFieldDefinition missing = invoke(service, "findField", new Class<?>[] { List.class, String.class },
                List.of(parent), "missing.path");

        assertEquals("nested.child", found.path());
        assertEquals(null, missing);

        Category labelCategory = new Category(15L, "Name", "CD");
        String label = invoke(service, "buildLabel", new Class<?>[] { Object.class, List.class }, labelCategory,
                List.of("name", "code"));
        assertEquals("Name · CD", label);

        String fallbackLabel = invoke(service, "buildLabel", new Class<?>[] { Object.class, List.class },
                new CategoryNoLabel(99L), List.of("missing"));
        assertEquals("99", fallbackLabel);

        String extractedId = invoke(service, "extractId", new Class<?>[] { Object.class }, new ChildWithInheritedId(7L));
        assertEquals("7", extractedId);

        Object staticFieldValue = invoke(service, "extractFieldValue", new Class<?>[] { Object.class, String.class },
                new StaticHolder(), "STATIC_VALUE");
        assertEquals(null, staticFieldValue);
    }

    @SuppressWarnings("unchecked")
    private static <T> T invoke(Object target, String methodName, Class<?>[] types, Object... args) throws Exception {
        Method method = target.getClass().getDeclaredMethod(methodName, types);
        method.setAccessible(true);
        return (T) method.invoke(target, args);
    }

    private static void setEntityManager(QueryEngineRelationOptionService service, EntityManager entityManager)
            throws Exception {
        Field field = QueryEngineRelationOptionService.class.getDeclaredField("entityManager");
        field.setAccessible(true);
        field.set(service, entityManager);
    }

    static class Widget {
    }

    static class Category {
        @Id
        private Long id;
        @SuppressWarnings("unused")
        private String name;
        @SuppressWarnings("unused")
        private String code;
        @SuppressWarnings("unused")
        private boolean deleted;
        @SuppressWarnings("unused")
        private String keywords;
        @SuppressWarnings("unused")
        private Instant createdAt;

        Category(Long id, String name, String code) {
            this.id = id;
            this.name = name;
            this.code = code;
        }
    }

    static class CategoryNoLabel {
        @Id
        private Long id;
        @SuppressWarnings("unused")
        private boolean deleted;
        @SuppressWarnings("unused")
        private String keywords;
        @SuppressWarnings("unused")
        private Instant createdAt;

        CategoryNoLabel(Long id) {
            this.id = id;
        }
    }

        static class BaseWithId {
                @Id
                private Long id;

                BaseWithId(Long id) {
                        this.id = id;
                }
        }

        static class ChildWithInheritedId extends BaseWithId {
                ChildWithInheritedId(Long id) {
                        super(id);
                }
        }

        static class StaticHolder {
                static String STATIC_VALUE = "X";
        }
}
