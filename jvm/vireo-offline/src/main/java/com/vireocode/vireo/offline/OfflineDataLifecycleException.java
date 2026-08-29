package com.vireocode.vireo.offline;

/** Raised when the Offline store cannot enforce its bounded lifecycle contract. */
public class OfflineDataLifecycleException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public OfflineDataLifecycleException(String message) {
        super(message);
    }
}
