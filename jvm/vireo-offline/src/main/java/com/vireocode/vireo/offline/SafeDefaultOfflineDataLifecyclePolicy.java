package com.vireocode.vireo.offline;

/** Safe fallback that stores no request payload or headers and applies bounded retention. */
public final class SafeDefaultOfflineDataLifecyclePolicy implements OfflineDataLifecyclePolicy {

    private final StarterOfflineProperties properties;

    public SafeDefaultOfflineDataLifecyclePolicy(StarterOfflineProperties properties) {
        this.properties = java.util.Objects.requireNonNull(properties, "properties");
    }

    @Override
    public OfflineDataLifecycleDecision classify(OfflineDataLifecycleContext context) {
        return new OfflineDataLifecycleDecision(
                context.ownerKey(),
                context.createdAt().plus(properties.getCommandRetention()),
                false,
                null,
                null);
    }
}
