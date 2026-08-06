package com.vireocode.starter.offline;

import org.springframework.http.HttpMethod;

public interface OfflineSyncReplayHandler {

    boolean supports(OfflineSyncCommandDto command, HttpMethod method);

    OfflineSyncCommandResultDto process(OfflineSyncCommandDto command, OfflineSyncCommandEntity entity);
}