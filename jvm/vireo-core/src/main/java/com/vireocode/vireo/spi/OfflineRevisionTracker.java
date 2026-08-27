package com.vireocode.vireo.spi;

/**
 * Tracks a monotonic revision number per entity kind so that offline clients
 * can tell whether their local copy is stale.
 *
 * <p>
 * Implemented by {@code OfflineEntityVersionService} in
 * {@code vireo-offline}.
 */
public interface OfflineRevisionTracker {

    /**
     * Increment and return the revision for {@code entityKey}.
     *
     * @return the new revision, or a non-positive value if the key is not
     *         tracked.
     */
    long bump(String entityKey);
}
