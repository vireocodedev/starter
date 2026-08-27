package com.vireocode.vireo.offline;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

final class OfflineSseBatchContext {

    private final String batchId = UUID.randomUUID().toString();
    private final List<OfflineSseBatchItem> events = new ArrayList<>();
    private boolean flushScheduled;

    void addEvent(OfflineSseBatchItem event) {
        events.add(event);
    }

    String getBatchId() {
        return batchId;
    }

    List<OfflineSseBatchItem> getEvents() {
        return List.copyOf(events);
    }

    boolean isFlushScheduled() {
        return flushScheduled;
    }

    void setFlushScheduled(boolean flushScheduled) {
        this.flushScheduled = flushScheduled;
    }

    void clear() {
        events.clear();
        flushScheduled = false;
    }
}