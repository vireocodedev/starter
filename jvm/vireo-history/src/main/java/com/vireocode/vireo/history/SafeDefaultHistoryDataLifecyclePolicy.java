package com.vireocode.vireo.history;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;

/**
 * Safe fallback: preserve event shape, discard snapshot fields, partition by
 * actor, retain for the configured bounded period, and create no legal hold.
 */
public final class SafeDefaultHistoryDataLifecyclePolicy implements HistoryDataLifecyclePolicy {

    private final StarterHistoryProperties properties;

    public SafeDefaultHistoryDataLifecyclePolicy(StarterHistoryProperties properties) {
        this.properties = java.util.Objects.requireNonNull(properties, "properties");
    }

    @Override
    public HistoryDataLifecycleDecision classify(HistoryDataLifecycleContext context) {
        String partition = context.actor() == null || context.actor().id() == null
                ? "system"
                : "actor:" + context.actor().id();
        return new HistoryDataLifecycleDecision(
                partition,
                context.occurredAt().plus(properties.getRetention()),
                false,
                redact(context.snapshotPrevious()),
                redact(context.snapshotCurrent()));
    }

    private JsonNode redact(JsonNode snapshot) {
        return snapshot == null ? null : JsonNodeFactory.instance.objectNode();
    }
}
