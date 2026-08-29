package com.vireocode.vireo.offline;

import org.springframework.http.HttpMethod;

public interface OfflineSyncReplayHandler {

    /**
     * Selects commands owned by this application handler. A command accepted by
     * no handler is rejected; Offline has no self-HTTP fallback.
     */
    boolean supports(OfflineSyncCommandDto command, HttpMethod method);

    /**
     * Replays one domain command. Persistence and retry state remain owned by the
     * Offline module; handlers return only the transport-neutral outcome. Dispatch
     * runs outside Offline's claim/finalize transactions, so a handler may define
     * its own domain transaction and must use the stable command ID to make effects
     * idempotent across crash recovery.
     */
    OfflineSyncCommandResultDto process(OfflineSyncCommandDto command);
}
