package com.vireocode.vireo.spi;

/**
 * Announces entity changes to connected clients.
 *
 * <p>
 * Implemented by {@code OfflineHeartbeatService} in
 * {@code vireo-offline}, which fans the events out over SSE. The
 * payload is typed as {@code Object} on purpose: it is the entity's DTO, and
 * core has no way to name that type.
 */
public interface OfflineChangeBroadcaster {

    void publishCreateEvent(String entity, Object payload, Long revision);

    void publishUpdateEvent(String entity, Object payload, Long revision);

    void publishDeleteEvent(String entity, Object payload, Long revision);
}
