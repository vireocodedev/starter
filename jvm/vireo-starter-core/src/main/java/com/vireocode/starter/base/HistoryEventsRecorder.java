package com.vireocode.starter.base;

public interface HistoryEventsRecorder {

    void recordCreate(HistoryEntityType entity, Object entityId, Object currentDto);

    void recordUpdate(HistoryEntityType entity, Object entityId, Object previousDto, Object currentDto);

    void recordDelete(HistoryEntityType entity, Object entityId, Object previousDto);
}
