package com.vireocode.offline;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;

class OfflineWireContractTest {

    @Test
    void requestAndResponseCollectionsAreDefensivelyCopied() {
        List<OfflineSyncCommandDto> commands = new ArrayList<>();
        Map<String, String> headers = new LinkedHashMap<>();
        headers.put("Idempotency-Key", "first");
        OfflineSyncCommandDto command = new OfflineSyncCommandDto(UUID.randomUUID(), "POST", "/api/widgets", null,
                headers);
        commands.add(command);

        OfflineSyncBatchRequestDto request = new OfflineSyncBatchRequestDto(commands);
        headers.put("Idempotency-Key", "changed");
        commands.clear();

        assertEquals(1, request.commands().size());
        assertEquals("first", request.commands().get(0).headers().get("Idempotency-Key"));
        assertThrows(UnsupportedOperationException.class, () -> request.commands().clear());
        assertThrows(UnsupportedOperationException.class,
                () -> request.commands().get(0).headers().put("Another", "value"));
        org.junit.jupiter.api.Assertions.assertFalse(command.toString().contains("first"));

        OfflineSyncCommandResultDto result = new OfflineSyncCommandResultDto(command.commandId(), true, 200, null);
        OfflineSyncBatchResponseDto response = new OfflineSyncBatchResponseDto(1, 0, new ArrayList<>(List.of(result)));
        assertThrows(UnsupportedOperationException.class, () -> response.results().clear());
        assertThrows(IllegalArgumentException.class,
                () -> new OfflineSyncBatchResponseDto(0, 0, List.of(result)));
    }
}
