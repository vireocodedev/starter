package com.vireocode.starter.queryengine;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

class QueryEngineRegistryTest {

    /**
     * Stands in for an application's own key set. The starter never sees this
     * type; it only sees {@link QueryEntityKey}.
     */
    enum TestEntityKey implements QueryEntityKey {
        ITEM,
        SAVED_FILTER,
        OFFLINE_SYNC_COMMAND
    }

    @Test
    void defaultConstructor_ProvidesEmptyRegistryAndRejectsUnregisteredTypes() {
        QueryEngineRegistry registry = new QueryEngineRegistry();

        assertTrue(registry.listEntities().isEmpty());
        assertTrue(registry.getEntityTypes().isEmpty());
        assertThrows(IllegalArgumentException.class, () -> registry.requireEntityKey(SomeDomainEntity.class));
    }

    @Test
    void autowiredConstructor_RegistersAllMappingsAndResolvesLookups() {
        QueryEntityTypeResolver resolver = () -> Map.of(
                TestEntityKey.ITEM, ItemEntity.class,
                TestEntityKey.SAVED_FILTER, SavedFilterEntity.class,
                TestEntityKey.OFFLINE_SYNC_COMMAND, OfflineSyncCommandEntity.class);

        QueryEngineRegistry registry = new QueryEngineRegistry(List.of(resolver));

        assertEquals(ItemEntity.class, registry.requireEntityType("item"));
        assertEquals(ItemEntity.class, registry.requireEntityType("  ITEM  "));
        assertEquals("ITEM", registry.requireEntityKey(ItemEntity.class));

        Map<String, Class<?>> entityTypes = registry.getEntityTypes();
        assertFalse(entityTypes.isEmpty());
        assertEquals(SavedFilterEntity.class, entityTypes.get("SAVED_FILTER"));
        assertEquals(3, registry.listEntities().size());
    }

    @Test
    void autowiredConstructor_MergesSeveralResolvers() {
        QueryEntityTypeResolver starterOwned = () -> Map.of(TestEntityKey.SAVED_FILTER, SavedFilterEntity.class);
        QueryEntityTypeResolver appOwned = () -> Map.of(TestEntityKey.ITEM, ItemEntity.class);

        QueryEngineRegistry registry = new QueryEngineRegistry(List.of(starterOwned, appOwned));

        assertEquals(SavedFilterEntity.class, registry.requireEntityType("SAVED_FILTER"));
        assertEquals(ItemEntity.class, registry.requireEntityType("ITEM"));
    }

    @Test
    void autowiredConstructor_RejectsConflictingBindingsForTheSameKey() {
        QueryEntityTypeResolver first = () -> Map.of(TestEntityKey.ITEM, ItemEntity.class);
        QueryEntityTypeResolver second = () -> Map.of(TestEntityKey.ITEM, SomeDomainEntity.class);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> new QueryEngineRegistry(List.of(first, second)));

        assertTrue(exception.getMessage().contains("Duplicate query engine entity key 'ITEM'"));
    }

    @Test
    void autowiredConstructor_RejectsDuplicateBindingsEvenWhenTypesMatch() {
        QueryEntityTypeResolver first = () -> Map.of(TestEntityKey.ITEM, ItemEntity.class);
        QueryEntityTypeResolver second = () -> Map.of(TestEntityKey.ITEM, ItemEntity.class);

        assertThrows(IllegalStateException.class, () -> new QueryEngineRegistry(List.of(first, second)));
    }

    @Test
    void requireEntityType_ThrowsForUnknownNullAndBlankKeys() {
        QueryEngineRegistry registry = new QueryEngineRegistry();

        assertThrows(IllegalArgumentException.class, () -> registry.requireEntityType("MISSING"));
        assertThrows(IllegalArgumentException.class, () -> registry.requireEntityType(null));
        assertThrows(IllegalArgumentException.class, () -> registry.requireEntityType("   "));
    }

    static class SomeDomainEntity {
    }

    static class ItemEntity {
    }

    static class SavedFilterEntity {
    }

    static class OfflineSyncCommandEntity {
    }
}
