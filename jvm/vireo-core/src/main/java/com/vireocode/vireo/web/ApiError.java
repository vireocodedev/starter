package com.vireocode.vireo.web;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

@Schema(name = "ApiError", description = "API error response")
public record ApiError(
        @Schema(description = "HTTP status code", example = "400") int status,
        @Schema(description = "Error message", example = "Bad request") String message,
        @Schema(description = "Additional error details (e.g., validation field errors)", nullable = true)
        Map<String, String> errors,
        @Schema(description = "Timestamp of error", example = "2026-06-25T12:34:56Z") Instant timestamp
) {
    public ApiError {
        message = Objects.requireNonNull(message, "message must not be null");
        timestamp = Objects.requireNonNull(timestamp, "timestamp must not be null");
        errors = errors == null ? null : Collections.unmodifiableMap(new LinkedHashMap<>(errors));
    }
}
