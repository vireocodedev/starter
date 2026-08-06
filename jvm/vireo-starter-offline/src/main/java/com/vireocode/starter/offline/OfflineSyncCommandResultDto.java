package com.vireocode.starter.offline;

import java.util.UUID;

public record OfflineSyncCommandResultDto(
        UUID commandId,
        boolean success,
        int status,
        String error,
        OfflineSyncResultReason reason) {

    /**
     * Convenience constructor for replay handlers: a successful replay is
     * {@link OfflineSyncResultReason#APPLIED}, while any failure raised by a
     * handler is transient and therefore {@link OfflineSyncResultReason#RETRYABLE}.
     */
    public OfflineSyncCommandResultDto(UUID commandId, boolean success, int status, String error) {
        this(commandId, success, status, error,
                success ? OfflineSyncResultReason.APPLIED : OfflineSyncResultReason.RETRYABLE);
    }
}
