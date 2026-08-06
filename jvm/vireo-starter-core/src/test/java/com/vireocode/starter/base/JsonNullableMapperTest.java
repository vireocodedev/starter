package com.vireocode.starter.base;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.openapitools.jackson.nullable.JsonNullable;

class JsonNullableMapperTest {

    private final JsonNullableMapper mapper = new JsonNullableMapper() {
    };

    @Test
    void wrap_Unwrap_AndIsPresent_CoverBranches() {
        JsonNullable<String> wrapped = mapper.wrap("value");
        assertTrue(mapper.isPresent(wrapped));
        assertEquals("value", mapper.unwrap(wrapped));

        JsonNullable<String> explicitNull = JsonNullable.of(null);
        assertTrue(mapper.isPresent(explicitNull));
        assertNull(mapper.unwrap(explicitNull));

        assertFalse(mapper.isPresent(null));
        assertNull(mapper.unwrap(null));
    }
}
