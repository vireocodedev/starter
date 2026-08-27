package com.vireocode.vireo.queryengine;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

class QueryEngineMetadataGeneratorAdditionalTest {

    @Test
    void generate_UsesInjectedCustomFieldProviderWhenPresent() {
        QueryEngineMetadataGenerator generator = new QueryEngineMetadataGenerator(new TestRegistry(),
            List.of(new InlineProvider()));

        QueryEntityDefinition definition = generator.generate("KEY", EntityWithInjectedCustomProvider.class);

        assertTrue(definition.fields().stream().anyMatch(field -> field.path().equals("inline.path")));
    }

    @Test
    void generate_RequiresCustomProviderToBeAContainerBean() {
        QueryEngineMetadataGenerator generator = new QueryEngineMetadataGenerator(new TestRegistry(), List.of());

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> generator.generate("KEY", EntityWithInstantiatedProvider.class));

        assertTrue(exception.getMessage().contains("Missing query custom field provider bean"));
    }

    @Test
    void generate_ThrowsWhenProviderCannotBeInstantiated() {
        QueryEngineMetadataGenerator generator = new QueryEngineMetadataGenerator(new TestRegistry(), List.of());

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> generator.generate("KEY", EntityWithInvalidProvider.class));

        assertTrue(exception.getMessage().contains("Missing query custom field provider bean"));
    }

    @Test
    void generate_CoversTypeResolutionOperatorDefaultsAndRelationModes() {
        QueryEngineMetadataGenerator generator = new QueryEngineMetadataGenerator(new TestRegistry(), List.of());

        QueryEntityDefinition definition = generator.generate("ADVANCED", AdvancedEntity.class);

        QueryFieldDefinition text = require(definition.fields(), "text");
        assertEquals(QueryFieldType.STRING, text.type());
        assertTrue(text.operators().contains(QueryOperator.CONTAINS));

        QueryFieldDefinition boolFlag = require(definition.fields(), "flag");
        assertEquals(QueryFieldType.BOOLEAN, boolFlag.type());
        assertTrue(boolFlag.operators().contains(QueryOperator.EQUALS));

        QueryFieldDefinition amount = require(definition.fields(), "amount");
        assertEquals(QueryFieldType.NUMBER, amount.type());
        assertTrue(amount.operators().contains(QueryOperator.GREATER_OR_EQUAL));
        assertFalse(amount.operators().contains(QueryOperator.DATE_RANGE));

        QueryFieldDefinition date = require(definition.fields(), "date");
        assertEquals(QueryFieldType.DATE, date.type());
        assertTrue(date.operators().contains(QueryOperator.DATE_RANGE));

        QueryFieldDefinition enumSingle = require(definition.fields(), "statusSingle");
        assertEquals(QueryFieldType.ENUM, enumSingle.type());
        assertFalse(enumSingle.operators().contains(QueryOperator.IN));

        QueryFieldDefinition enumMulti = require(definition.fields(), "statusMulti");
        assertTrue(enumMulti.operators().contains(QueryOperator.IN));
        assertEquals(List.of("OPEN", "CLOSED"), enumMulti.enumValues());

        QueryFieldDefinition explicitOperators = require(definition.fields(), "explicitOperators");
        assertEquals(List.of(QueryOperator.EQUALS), explicitOperators.operators());

        QueryFieldDefinition relSelect = require(definition.fields(), "relationSelection");
        assertEquals(QueryFieldType.RELATION, relSelect.type());
        assertEquals(RelationFilterMode.SELECTION, relSelect.relationMode());
        assertTrue(relSelect.children().isEmpty());

        QueryFieldDefinition relBoth = require(definition.fields(), "relationBoth");
        assertEquals(RelationFilterMode.BOTH, relBoth.relationMode());
        assertFalse(relBoth.children().isEmpty());

        QueryFieldDefinition relCollection = require(definition.fields(), "relations");
        assertTrue(relCollection.children().isEmpty());
    }

    private QueryFieldDefinition require(List<QueryFieldDefinition> fields, String path) {
        return fields.stream().filter(field -> field.path().equals(path)).findFirst().orElseThrow();
    }

    private static final class TestRegistry extends QueryEngineRegistry {
        @Override
        public String requireEntityKey(Class<?> entityType) {
            return entityType.getSimpleName().toUpperCase();
        }
    }

    @FilterableCustomFields(InlineProvider.class)
    static class EntityWithInjectedCustomProvider {
        @Filterable
        private String name;
    }

    @FilterableCustomFields(DefaultProvider.class)
    static class EntityWithInstantiatedProvider {
        @Filterable
        private String name;
    }

    @FilterableCustomFields(NoDefaultConstructorProvider.class)
    static class EntityWithInvalidProvider {
        @Filterable
        private String name;
    }

    static class InlineProvider implements QueryCustomFieldProvider {
        @Override
        public List<QueryFieldDefinition> getFields() {
            return List.of(new QueryFieldDefinition("inline.path", "Inline", QueryFieldType.STRING, null,
                    List.of(), List.of(QueryOperator.CONTAINS), false, null, RelationFilterMode.CHILD, false,
                    List.of(), false, 0, List.of()));
        }
    }

    static class DefaultProvider implements QueryCustomFieldProvider {
        @Override
        public List<QueryFieldDefinition> getFields() {
            return List.of(new QueryFieldDefinition("instantiated.path", "Instantiated", QueryFieldType.STRING, null,
                    List.of(), List.of(QueryOperator.CONTAINS), false, null, RelationFilterMode.CHILD, false,
                    List.of(), false, 0, List.of()));
        }
    }

    static class NoDefaultConstructorProvider implements QueryCustomFieldProvider {
        private final String value;

        NoDefaultConstructorProvider(String value) {
            this.value = value;
        }

        @Override
        public List<QueryFieldDefinition> getFields() {
            return List.of(new QueryFieldDefinition(value, value, QueryFieldType.STRING, null, List.of(), List.of(),
                    false, null, RelationFilterMode.CHILD, false, List.of(), false, 0, List.of()));
        }
    }

    enum Status {
        OPEN,
        CLOSED
    }

    @FilterableMetadata(relationSelectionLabelFields = { "displayName" })
    static class RelatedEntity {
        @Id
        @SuppressWarnings("unused")
        private Long id;
        @SuppressWarnings("unused")
        private String displayName;

        @Filterable
        private String keyword;
    }

    static class AdvancedEntity {
        @Filterable
        private String text;

        @Filterable
        private boolean flag;

        @Filterable
        private BigDecimal amount;

        @Filterable
        private LocalDate date;

        @Filterable(multiple = false)
        private Status statusSingle;

        @Filterable(multiple = true)
        private Status statusMulti;

        @Filterable(label = "customLabel", operators = { QueryOperator.EQUALS })
        private String explicitOperators;

        @ManyToOne
        @Filterable(relationMode = RelationFilterMode.SELECTION, relationSelectionLabelFields = { "displayName" })
        private RelatedEntity relationSelection;

        @ManyToOne
        @Filterable(relationMode = RelationFilterMode.BOTH, maxDepth = 2)
        private RelatedEntity relationBoth;

        @OneToMany
        @Filterable(relationMode = RelationFilterMode.BOTH)
        private List<RelatedEntity> relations;
    }
}
