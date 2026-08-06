package com.vireocode.starter.base;

import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * Immutable per-entity configuration consumed by {@link BaseService}. Groups
 * all
 * "entity settings" in one place: which fields feed keyword search, whether
 * deletion is soft or physical, and whether the entity records change history.
 */
@Getter
@Setter
@Builder

public final class EntityConfig {
    @Builder.Default
    private final List<String> localSearchableFields = List.of();
    @Builder.Default
    private final List<String> relationSearchableFields = List.of();
    @Builder.Default
    private final boolean softDelete = false;
    private final HistoryEntityType history;

    public boolean recordsHistory() {
        return history != null;
    }

}
