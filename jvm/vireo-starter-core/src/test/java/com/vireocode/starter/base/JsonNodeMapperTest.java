package com.vireocode.starter.base;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

class JsonNodeMapperTest {

    @Test
    void toNode_ReturnsNullForNullAndBlankButRejectsInvalidJson() throws Exception {
        TestJsonNodeMapper mapper = new TestJsonNodeMapper();
        ObjectMapper objectMapper = mock(ObjectMapper.class);
        mapper.objectMapper = objectMapper;

        when(objectMapper.readTree("{\"x\":1}"))
                .thenReturn(new ObjectMapper().readTree("{\"x\":1}"));
        when(objectMapper.readTree("invalid")).thenThrow(new RuntimeException("boom"));

        assertNull(mapper.toNode(null));
        assertNull(mapper.toNode("   "));
        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, () -> mapper.toNode("invalid"));
        assertEquals("Could not parse persisted JSON", error.getMessage());
    }

    @Test
    void toNode_AndToString_MapValidValues() {
        TestJsonNodeMapper mapper = new TestJsonNodeMapper();
        mapper.objectMapper = new ObjectMapper();

        JsonNode node = mapper.toNode("{\"a\":2}");
        assertEquals("2", node.get("a").asText());

        assertNull(mapper.toString(null));
        assertEquals("{\"a\":2}", mapper.toString(node));
    }

    static class TestJsonNodeMapper extends JsonNodeMapper {
    }
}
