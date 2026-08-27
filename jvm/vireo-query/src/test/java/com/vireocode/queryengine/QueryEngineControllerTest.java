package com.vireocode.queryengine;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

class QueryEngineControllerTest {

    @Test
    void listEntities_ReturnsSortedEntitiesWithRecursiveFieldCounts() {
        QueryEngineRegistry registry = mock(QueryEngineRegistry.class);
        QueryEngineMetadataGenerator generator = mock(QueryEngineMetadataGenerator.class);
        QueryEngineRelationOptionService relationOptionService = mock(QueryEngineRelationOptionService.class);

        QueryEngineController controller = new QueryEngineController(registry, generator, relationOptionService);

        when(registry.getEntityTypes()).thenReturn(Map.of(
                "WIDGET", WidgetEntity.class,
                "ORDER", OrderEntity.class));

        QueryFieldDefinition nested = new QueryFieldDefinition("widget.category", "Category", QueryFieldType.RELATION,
                null, List.of(), List.of(), true, "CATEGORY", RelationFilterMode.BOTH, false, List.of(), true, 2,
                List.of());
        QueryFieldDefinition widgetRoot = new QueryFieldDefinition("widget", "Widget", QueryFieldType.RELATION, null,
                List.of(), List.of(), true, "WIDGET", RelationFilterMode.BOTH, false, List.of(), true, 2,
                List.of(nested));
        QueryEntityDefinition widgetDef = new QueryEntityDefinition("WIDGET", "Widget", WidgetEntity.class.getName(),
                List.of(widgetRoot));
        QueryEntityDefinition orderDef = new QueryEntityDefinition("ORDER", "Order",
                OrderEntity.class.getName(), List.of(
                        new QueryFieldDefinition("number", "number", QueryFieldType.STRING, null, List.of(),
                                List.of(), false, null, RelationFilterMode.CHILD, false, List.of(), false, 0,
                                List.of())));

        when(generator.generate("WIDGET", WidgetEntity.class)).thenReturn(widgetDef);
        when(generator.generate("ORDER", OrderEntity.class)).thenReturn(orderDef);

        List<QueryEntitySummary> result = controller.listEntities();

        assertEquals(2, result.size());
        assertEquals("ORDER", result.get(0).key());
        assertEquals(1, result.get(0).filterableFieldCount());
        assertEquals("WIDGET", result.get(1).key());
        assertEquals(2, result.get(1).filterableFieldCount());
    }

    @Test
    void getEntitiesConfig_ContainsEntitySummariesAndDefinitions() {
        QueryEngineRegistry registry = mock(QueryEngineRegistry.class);
        QueryEngineMetadataGenerator generator = mock(QueryEngineMetadataGenerator.class);
        QueryEngineRelationOptionService relationOptionService = mock(QueryEngineRelationOptionService.class);

        QueryEngineController controller = new QueryEngineController(registry, generator, relationOptionService);

        when(registry.getEntityTypes()).thenReturn(Map.of("ORDER", OrderEntity.class));
        QueryEntityDefinition orderDef = new QueryEntityDefinition("ORDER", "Order", OrderEntity.class.getName(),
                List.of(new QueryFieldDefinition("number", "number", QueryFieldType.STRING, null, List.of(),
                        List.of(), false, null, RelationFilterMode.CHILD, false, List.of(), false, 0, List.of())));
        when(generator.generate("ORDER", OrderEntity.class)).thenReturn(orderDef);

        QueryEngineEntitiesConfig config = controller.getEntitiesConfig();

        assertEquals(1, config.entities().size());
        assertEquals("ORDER", config.entities().get(0).key());
        assertEquals(1, config.entityDefinitions().size());
        assertEquals("ORDER", config.entityDefinitions().get("ORDER").key());
    }

    @Test
    void describeEntity_DelegatesToRegistryAndGenerator() {
        QueryEngineRegistry registry = mock(QueryEngineRegistry.class);
        QueryEngineMetadataGenerator generator = mock(QueryEngineMetadataGenerator.class);
        QueryEngineRelationOptionService relationOptionService = mock(QueryEngineRelationOptionService.class);
        QueryEngineController controller = new QueryEngineController(registry, generator, relationOptionService);

        QueryEntityDefinition definition = new QueryEntityDefinition("WIDGET", "Widget", WidgetEntity.class.getName(),
                List.of());
        doReturn(WidgetEntity.class).when(registry).requireEntityType("WIDGET");
        when(generator.generate("WIDGET", WidgetEntity.class)).thenReturn(definition);

        QueryEntityDefinition result = controller.describeEntity("WIDGET");

        assertEquals("WIDGET", result.key());
        verify(registry).requireEntityType("WIDGET");
        verify(generator).generate("WIDGET", WidgetEntity.class);
    }

    @Test
    void listRelationOptions_DelegatesToService() {
        QueryEngineRegistry registry = mock(QueryEngineRegistry.class);
        QueryEngineMetadataGenerator generator = mock(QueryEngineMetadataGenerator.class);
        QueryEngineRelationOptionService relationOptionService = mock(QueryEngineRelationOptionService.class);
        QueryEngineController controller = new QueryEngineController(registry, generator, relationOptionService);

        List<QueryRelationOption> options = List.of(new QueryRelationOption("1", "Alpha"));
        when(relationOptionService.listOptions("WIDGET", "category", "te")).thenReturn(options);

        List<QueryRelationOption> result = controller.listRelationOptions("WIDGET", "category", "te");

        assertEquals(1, result.size());
        assertEquals("Alpha", result.get(0).label());
    }

    static class WidgetEntity {
    }

    static class OrderEntity {
    }
}
