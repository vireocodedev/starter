package com.vireocode.vireo.history;

/** Raised when a safe History lifecycle decision cannot be enforced. */
public class HistoryDataLifecycleException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public HistoryDataLifecycleException(String message) {
        super(message);
    }
}
