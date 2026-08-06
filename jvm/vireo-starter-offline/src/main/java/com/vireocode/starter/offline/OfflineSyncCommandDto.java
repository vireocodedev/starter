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
}
