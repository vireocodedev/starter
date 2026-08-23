package com.vireocode.starter.history;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("${vireo.starter.history.endpoint-path:/api/history}")
@Tag(name = "History")
public class HistoryController {

    private final HistoryRepository repository;
    private final ObjectMapper objectMapper;
    private final StarterHistoryProperties properties;

    public HistoryController(HistoryRepository repository, ObjectMapper objectMapper,
            StarterHistoryProperties properties) {
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.properties = properties;
    }

    @GetMapping
    @PreAuthorize("@historyReadAuthorizer.canRead(authentication, #entity, #entityId)")
    public List<HistoryRecord> find(
            @RequestParam("entity") @NotBlank @Size(max = 32) String entity,
            @RequestParam("entityId") @NotBlank @Size(max = 64) String entityId,
            @RequestParam(value = "limit", required = false) @Positive Integer requestedLimit) {
        int limit = resolveLimit(requestedLimit);
        Pageable mostRecentFirst = PageRequest.of(0, limit);

        List<HistoryEntry> mostRecentDescending = repository
                .findByEntityAndEntityIdOrderByOccurredAtDescIdDesc(entity.trim(), entityId.trim(), mostRecentFirst);

        List<HistoryEntry> ascending = new ArrayList<>(mostRecentDescending);
        Collections.reverse(ascending);

        return ascending.stream()
                .map(this::toDto)
                .toList();
    }

    private int resolveLimit(Integer requestedLimit) {
        return requestedLimit == null
                ? properties.getDefaultLimit()
                : Math.min(requestedLimit, properties.getMaxLimit());
    }

    private HistoryRecord toDto(HistoryEntry entry) {
        HistoryActor actor = entry.getActorLabel() == null
                ? null
                : new HistoryActor(entry.getActorId(), entry.getActorLabel());
        return new HistoryRecord(
                entry.getId(),
                entry.getOccurredAt(),
                actor,
                entry.getEntity(),
                entry.getEntityId(),
                parseSnapshot(entry.getSnapshotPrevious()),
                parseSnapshot(entry.getSnapshotCurrent()));
    }

    private JsonNode parseSnapshot(String snapshot) {
        if (snapshot == null) {
            return null;
        }
        try {
            return objectMapper.readTree(snapshot);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Persisted history snapshot is not valid JSON", exception);
        }
    }
}
