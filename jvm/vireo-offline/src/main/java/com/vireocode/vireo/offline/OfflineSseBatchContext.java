package com.vireocode.vireo.offline;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

final class OfflineSseBatchContext {

    private final String batchId = UUID.randomUUID().toString();
    private final List<OfflineSseBatchItem> events = new ArrayList<>();
    private String audience;
    private boolean flushScheduled;

    void addEvent(String eventAudience, OfflineSseBatchItem event) {
        if (audience == null) {
            audience = eventAudience;
        } else if (!audience.equals(eventAudience)) {
            throw new IllegalStateException("One transaction cannot publish offline SSE events to multiple audiences");
        }
        events.add(event);
    }

    String getAudience() {
        return audience;
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
        audience = null;
        flushScheduled = false;
    }
}
