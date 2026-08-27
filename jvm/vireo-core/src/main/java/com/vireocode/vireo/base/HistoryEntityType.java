package com.vireocode.vireo.base;

/**
 * Identifies a kind of entity whose changes are recorded in the change-history
 * feature.
 *
 * <p>
 * This is an open extension point, not a fixed set. The starter records
 * whatever the application declares — usually an enum:
 *
 * <pre>{@code
 * public enum AppHistoryEntityType implements HistoryEntityType {
 *     ITEM
 * }
 * }</pre>
 *
 * <p>
 * An enum satisfies {@link #name()} for free. Declare the value on the
 * entity's {@link EntityConfig} and every create, update and delete is audited
 * under it.
 *
 * <p>
 * The value is persisted on each history row and read by the frontend to
 * resolve entity-specific field translations when rendering diffs.
 */
public interface HistoryEntityType {

    /**
     * The stable, persisted identifier for this entity type. Implemented
     * automatically by any enum.
     */
    String name();
}
