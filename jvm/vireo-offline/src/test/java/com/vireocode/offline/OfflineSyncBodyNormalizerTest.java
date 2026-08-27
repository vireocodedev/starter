package com.vireocode.offline;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

class OfflineSyncBodyNormalizerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void normalize_ReturnsNullNodeWhenBodyIsNull() {
        JsonNode normalized = OfflineSyncBodyNormalizer.normalize(null, objectMapper);
        assertTrueNullNode(normalized);
    }

    @Test
    void normalize_ReturnsNullNodeWhenBodyIsJsonNull() {
        JsonNode normalized = OfflineSyncBodyNormalizer.normalize(objectMapper.nullNode(), objectMapper);
        assertTrueNullNode(normalized);
    }

    @Test
    void normalize_UnwrapsArrayPropertyWhenPresent() throws Exception {
        JsonNode body = objectMapper.readTree("{\"array\":{\"name\":\"x\"},\"ignored\":1}");

        JsonNode normalized = OfflineSyncBodyNormalizer.normalize(body, objectMapper);

        assertEquals("x", normalized.get("name").asText());
    }

    @Test
    void normalize_UnwrapsSingleElementArrayBody() throws Exception {
        JsonNode body = objectMapper.readTree("[{\"id\":7}]");

        JsonNode normalized = OfflineSyncBodyNormalizer.normalize(body, objectMapper);

        assertEquals(7, normalized.get("id").asInt());
    }

    @Test
    void normalize_ReturnsOriginalBodyForOtherShapes() throws Exception {
        JsonNode body = objectMapper.readTree("[{\"id\":1},{\"id\":2}]");

        JsonNode normalized = OfflineSyncBodyNormalizer.normalize(body, objectMapper);

        assertSame(body, normalized);
    }

    @Test
    void treeToValue_ConvertsNormalizedNode() throws Exception {
        JsonNode body = objectMapper.readTree("{\"array\":{\"name\":\"Widget\"}}");

        Payload payload = OfflineSyncBodyNormalizer.treeToValue(body, objectMapper, Payload.class);

        assertEquals("Widget", payload.name);
    }

    private void assertTrueNullNode(JsonNode node) {
        assertEquals("null", node.getNodeType().name().toLowerCase());
    }

    public static class Payload {
        public String name;
    }
}
