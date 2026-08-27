package com.vireocode.consumer;

import com.vireocode.vireo.base.HistoryEntityType;

/**
 * The library owns the {@code history} table but not the values that may appear
 * in its {@code entity} column. A consumer names its own auditable entities.
 */
public enum ConsumerHistoryEntityType implements HistoryEntityType {
    ITEM
}
