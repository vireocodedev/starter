package com.vireocode.offline;

import org.springframework.http.HttpMethod;

public interface OfflineSyncReplayHandler {

    boolean supports(OfflineSyncCommandDto command, HttpMethod method);

    /**
     * Replays one domain command. Persistence and retry state remain owned by the
     * Offline module; handlers return only the transport-neutral outcome.
     */
    OfflineSyncCommandResultDto process(OfflineSyncCommandDto command);
}
