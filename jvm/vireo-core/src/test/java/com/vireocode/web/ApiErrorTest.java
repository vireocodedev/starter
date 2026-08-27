package com.vireocode.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;

class ApiErrorTest {

    @Test
    void copiesErrorDetailsAndPreservesTheirOrder() {
        Map<String, String> details = new LinkedHashMap<>();
        details.put("first", "one");
        details.put("second", "two");

        ApiError error = new ApiError(400, "Bad request", details, Instant.EPOCH);
        details.clear();

        assertThat(error.errors()).containsExactly(
                Map.entry("first", "one"),
                Map.entry("second", "two"));
        assertThatThrownBy(() -> error.errors().put("third", "three"))
                .isInstanceOf(UnsupportedOperationException.class);
    }
}
