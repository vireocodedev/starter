package com.vireocode.starter.base;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

/**
 * Immutable per-entity configuration consumed by {@link BaseService}. Groups
 * all
 * "entity settings" in one place: which fields feed keyword search, whether
 * deletion is soft or physical, and whether the entity records change history.
 */
@Getter
public final class EntityConfig {
    private final List<String> localSearchableFields;
    private final List<String> relationSearchableFields;
    private final boolean softDelete;
    private final HistoryEntityType history;

    @Builder
    private EntityConfig(List<String> localSearchableFields, List<String> relationSearchableFields,
            boolean softDelete, HistoryEntityType history) {
        this.localSearchableFields = validatedFieldNames(localSearchableFields, "localSearchableFields");
        this.relationSearchableFields = validatedFieldNames(relationSearchableFields, "relationSearchableFields");
        this.softDelete = softDelete;
        this.history = history;

        if (history != null && (history.name() == null || history.name().isBlank())) {
            throw new IllegalArgumentException("history.name() must not be blank");
        }
    }

    public boolean recordsHistory() {
        return history != null;
    }

    private static List<String> validatedFieldNames(List<String> values, String property) {
        if (values == null) {
            return List.of();
        }

        List<String> copy = List.copyOf(values);
        if (copy.stream().anyMatch(value -> value == null || value.isBlank())) {
            throw new IllegalArgumentException(property + " must contain only non-blank field names");
        }
        if (copy.stream().distinct().count() != copy.size()) {
            throw new IllegalArgumentException(property + " must not contain duplicate field names");
        }
        return copy;
    }

}
