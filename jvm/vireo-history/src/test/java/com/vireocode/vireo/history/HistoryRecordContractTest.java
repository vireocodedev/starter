package com.vireocode.vireo.history;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.InputStream;

import org.junit.jupiter.api.Test;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

class HistoryRecordContractTest {

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    @Test
    void sharedFixtureDeserializesAndRoundTripsThroughTheJvmContract() throws IOException {
        JsonNode fixture = readFixture();

        HistoryRecord record = objectMapper.treeToValue(fixture, HistoryRecord.class);

        assertThat(record.actor()).isEqualTo(new HistoryActor("user-42", "Niko Barić"));
        assertThat(record.entity()).isEqualTo("CUSTOMER");
        assertThat(record.snapshotPrevious().get("active").booleanValue()).isFalse();
        JsonNode serialized = objectMapper.valueToTree(record);
        assertThat(serialized).isEqualTo(fixture);
    }

    private JsonNode readFixture() throws IOException {
        try (InputStream input = getClass().getResourceAsStream("/history-record.json")) {
            if (input == null) {
                throw new IllegalStateException("Shared history-record.json fixture is missing");
            }
            return objectMapper.readTree(input);
        }
    }
}
