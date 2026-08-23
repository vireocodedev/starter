package com.vireocode.starter.history;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.InputStream;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

class HistoryRecordContractTest {

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

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
