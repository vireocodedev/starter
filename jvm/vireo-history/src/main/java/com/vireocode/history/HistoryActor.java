package com.vireocode.history;

import java.util.Objects;

/**
 * Transport-neutral identity attached to a history record.
 *
 * @param id stable application-owned actor identifier, or {@code null}
 * @param label non-blank human-readable actor label
 */
public record HistoryActor(String id, String label) {

    public HistoryActor {
        label = Objects.requireNonNull(label, "label must not be null").trim();
        if (label.isEmpty()) {
            throw new IllegalArgumentException("label must not be blank");
        }
        if (id != null) {
            id = id.trim();
            if (id.isEmpty()) {
                id = null;
            }
        }
    }
}
