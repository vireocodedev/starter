package com.vireocode.starter.spi;

import com.vireocode.starter.base.HistoryEntityType;

/**
 * Records entity lifecycle snapshots for a history implementation.
 *
 * <p>Zero or one bean is supported. Core requires one only when an
 * {@code EntityConfig} enables history; otherwise the seam is dormant. A
 * recording failure aborts the surrounding CRUD transaction.
 */
public interface HistoryEventsRecorder {

    void recordCreate(HistoryEntityType entity, Object entityId, Object currentDto);

    void recordUpdate(HistoryEntityType entity, Object entityId, Object previousDto, Object currentDto);

    void recordDelete(HistoryEntityType entity, Object entityId, Object previousDto);
}
