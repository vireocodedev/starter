package com.vireocode.vireo.base;

import org.mapstruct.Mapper;
import org.springframework.beans.factory.annotation.Autowired;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Mapper(componentModel = "spring")
public abstract class JsonNodeMapper {

    @Autowired
    protected ObjectMapper objectMapper;

    /**
     * Maps database JSON String to Jackson JsonNode for DTO representation.
     */
    public JsonNode toNode(String source) {
        if (source == null || source.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readTree(source);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Could not parse persisted JSON", ex);
        }
    }

    /**
     * Maps Jackson JsonNode back to String for database storage.
     */
    public String toString(JsonNode source) {
        return source == null ? null : source.toString();
    }
}
