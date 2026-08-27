package com.vireocode.vireo.queryengine;

/**
 * Identifies an entity the query engine can filter over.
 *
 * <p>
 * This is an open extension point, not a fixed set. The starter does not
 * know which entities an application has, so it declares the shape of a key and
 * lets the application supply the members — usually as an enum:
 *
 * <pre>{@code
 * public enum AppQueryEntityKey implements QueryEntityKey {
 *     ITEM,
 *     SAVED_FILTER,
 *     OFFLINE_SYNC_COMMAND
 * }
 * }</pre>
 *
 * <p>
 * An enum satisfies {@link #name()} for free. Bind each member to its JPA
 * entity in a {@link QueryEntityTypeResolver}; that binding is the only
 * registration step.
 *
 * <p>
 * Keys are persisted and travel over the wire as their {@link #name()}, so
 * they must agree with the frontend mirror in
 * {@code frontend/src/app/infrastructure/queryEngine/queryengine.entityKeys.ts}.
 * Comparison is case-insensitive; everything else must match exactly.
 */
public interface QueryEntityKey {

    /**
     * The stable, persisted identifier for this entity. Implemented
     * automatically by any enum.
     */
    String name();
}
