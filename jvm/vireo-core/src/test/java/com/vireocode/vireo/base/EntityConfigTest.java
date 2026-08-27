package com.vireocode.vireo.base;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;

class EntityConfigTest {

    @Test
    void copiesConfiguredFieldCollections() {
        List<String> fields = new ArrayList<>(List.of("name"));

        EntityConfig config = EntityConfig.builder().localSearchableFields(fields).build();
        fields.add("code");

        assertThat(config.getLocalSearchableFields()).containsExactly("name");
        assertThatThrownBy(() -> config.getLocalSearchableFields().add("other"))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void rejectsBlankAndDuplicateFieldNames() {
        assertThatThrownBy(() -> EntityConfig.builder().localSearchableFields(List.of("name", " ")).build())
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("non-blank");
        assertThatThrownBy(() -> EntityConfig.builder().relationSearchableFields(List.of("owner", "owner")).build())
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("duplicate");
    }

    @Test
    void rejectsBlankHistoryIdentifiers() {
        assertThatThrownBy(() -> EntityConfig.builder().history(() -> " ").build())
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("history.name()");
    }
}
