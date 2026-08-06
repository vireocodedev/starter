package com.vireocode.starter.queryengine;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.vireocode.starter.base.BaseEntity;

import jakarta.persistence.ManyToOne;

class QueryEngineMetadataGeneratorTest {

    private final QueryEngineMetadataGenerator generator = new QueryEngineMetadataGenerator(new QueryEngineRegistry());

    @Test
    void generate_UsesOptInAnnotations() {
        QueryEntityDefinition definition = generator.generate("ITEM", SampleEntity.class);

        assertEquals("ITEM", definition.key());
        assertEquals("item.item", definition.title());
        assertEquals(SampleEntity.class.getName(), definition.javaType());
        assertTrue(hasField(definition.fields(), "name"));
        assertTrue(hasField(definition.fields(), "description"));
        assertTrue(hasField(definition.fields(), "quantity"));
        assertTrue(hasField(definition.fields(), "status"));

        // Metadata generation is opt-in: fields without @Filterable stay out of
        // the published contract, including everything inherited from BaseEntity.
        assertFalse(hasField(definition.fields(), "id"));
        assertFalse(hasField(definition.fields(), "keywords"));
        assertFalse(hasField(definition.fields(), "deleted"));
        assertFalse(hasField(definition.fields(), "createdAt"));
    }

    @Test
    void generate_ExpandsRelationsIntoChildPaths() {
        QueryEngineMetadataGenerator customGenerator = new QueryEngineMetadataGenerator(new TestRegistry());

        QueryEntityDefinition definition = customGenerator.generate("owner", OwnerWithOverride.class);
        QueryFieldDefinition relation = requireField(definition.fields(), "relation");

        assertTrue(relation.relation());
        assertTrue(relation.expandable());
        assertTrue(hasField(relation.children(), "relation.metadataLabel"));
        assertTrue(hasField(relation.children(), "relation.overrideLabel"));
    }

    @Test
    void generate_PrefersFieldLevelRelationSelectionLabelFieldsOverClassMetadata() {
        QueryEngineMetadataGenerator customGenerator = new QueryEngineMetadataGenerator(new TestRegistry());

        QueryEntityDefinition definition = customGenerator.generate("owner", OwnerWithOverride.class);
        QueryFieldDefinition relationField = requireField(definition.fields(), "relation");

        assertIterableEquals(List.of("overrideLabel"), relationField.relationSelectionLabelFields());
    }

    @Test
    void generate_ThrowsWhenMetadataRelationSelectionLabelFieldDoesNotExist() {
        QueryEngineMetadataGenerator customGenerator = new QueryEngineMetadataGenerator(new TestRegistry());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> customGenerator.generate("owner-invalid", OwnerWithInvalidMetadata.class));

        assertTrue(exception.getMessage().contains("relationSelectionLabelFields"));
    }

    private boolean hasField(List<QueryFieldDefinition> fields, String path) {
        return fields.stream().anyMatch(field -> field.path().equals(path));
    }

    private QueryFieldDefinition requireField(List<QueryFieldDefinition> fields, String path) {
        QueryFieldDefinition field = fields.stream()
                .filter(candidate -> candidate.path().equals(path))
                .findFirst()
                .orElse(null);

        assertNotNull(field, "Expected field " + path);
        return field;
    }

    private static final class TestRegistry extends QueryEngineRegistry {
        @Override
        public String requireEntityKey(Class<?> entityType) {
            return entityType.getSimpleName();
        }
    }

    /**
     * Mirrors the shape of a consumer's annotated entity: one filter of each kind,
     * and an unannotated field, on top of the inherited {@link BaseEntity} columns
     * that must stay out of the published contract.
     */
    @FilterableMetadata(title = "item.item")
    @SuppressWarnings("unused")
    private static class SampleEntity extends BaseEntity {
        private Long id;

        @Filterable(label = "item.name", operators = { QueryOperator.CONTAINS, QueryOperator.EQUALS })
        private String name;

        @Filterable(label = "item.description", operators = { QueryOperator.CONTAINS, QueryOperator.EQUALS })
        private String description;

        @Filterable(label = "item.quantity")
        private Integer quantity;

        @Filterable(label = "item.status")
        private String status;
    }

    @FilterableMetadata(title = "test.relationWithMetadata", relationSelectionLabelFields = { "metadataLabel" })
    @SuppressWarnings("unused")
    private static class RelationWithMetadata {
        private Long id;

        @Filterable(label = "Metadata label")
        private String metadataLabel;

        @Filterable(label = "Override label")
        private String overrideLabel;
    }

    private static class OwnerWithOverride {
        private Long id;

        @ManyToOne
        @Filterable(label = "Relation", expand = true, relationSelectionLabelFields = { "overrideLabel" })
        private RelationWithMetadata relation;
    }

    @FilterableMetadata(relationSelectionLabelFields = { "missingField" })
    @SuppressWarnings("unused")
    private static class RelationWithInvalidMetadata {
        private Long id;

        private String existingField;
    }

    private static class OwnerWithInvalidMetadata {
        private Long id;

        @ManyToOne
        @Filterable(label = "Relation")
        private RelationWithInvalidMetadata relation;
    }
}
