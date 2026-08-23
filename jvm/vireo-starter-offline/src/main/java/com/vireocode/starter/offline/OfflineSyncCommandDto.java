package com.vireocode.starter.offline;

import java.util.Map;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OfflineSyncCommandDto(
        @NotNull UUID commandId,
        @NotBlank String method,
        @NotBlank String url,
        JsonNode body,
        Map<String, String> headers) {

    public OfflineSyncCommandDto {
        headers = headers == null ? Map.of() : Map.copyOf(headers);
    }

    /** Omits potentially sensitive body and header values from diagnostics. */
    @Override
    public String toString() {
        return "OfflineSyncCommandDto[commandId=" + commandId + ", method=" + method + ", url=" + url + "]";
    }
}
