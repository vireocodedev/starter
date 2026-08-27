package com.vireocode.offline;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class OfflineSyncBodyNormalizer {

    private OfflineSyncBodyNormalizer() {
    }

    public static JsonNode normalize(JsonNode body, ObjectMapper objectMapper) {
        if (body == null || body.isNull()) {
            return objectMapper.nullNode();
        }

        JsonNode wrappedArray = body.get("array");
        if (wrappedArray != null && !wrappedArray.isNull()) {
            return wrappedArray;
        }

        if (body.isArray() && body.size() == 1) {
            return body.get(0);
        }

        return body;
    }

    public static <T> T treeToValue(JsonNode body, ObjectMapper objectMapper, Class<T> type) throws Exception {
        return objectMapper.treeToValue(normalize(body, objectMapper), type);
    }
}