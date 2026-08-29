package com.vireocode.vireo.history;

import java.time.Clock;
import java.time.Instant;
import java.util.Objects;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vireocode.vireo.base.HistoryEntityType;
import com.vireocode.vireo.spi.HistoryEventsRecorder;

/**
 * Central sink for entity change history. Serializes DTO snapshots to JSON and
 * stamps each row with the acting user resolved from the security context.
 */
class HistoryRecorder implements HistoryEventsRecorder {

    private final HistoryRepository repository;
    private final ObjectMapper objectMapper;
    private final HistoryActorResolver actorResolver;
    private final Clock clock;
    private final HistoryDataLifecyclePolicy lifecyclePolicy;
    private final HistoryDataLifecycleService lifecycleService;

    HistoryRecorder(HistoryRepository repository, ObjectMapper objectMapper,
            HistoryActorResolver actorResolver, Clock clock,
            HistoryDataLifecyclePolicy lifecyclePolicy, HistoryDataLifecycleService lifecycleService) {
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.actorResolver = actorResolver;
        this.clock = clock;
        this.lifecyclePolicy = lifecyclePolicy;
        this.lifecycleService = lifecycleService;
    }

    public void recordCreate(HistoryEntityType entity, Object entityId, Object currentDto) {
        record(entity, entityId, null, currentDto);
    }

    public void recordUpdate(HistoryEntityType entity, Object entityId, Object previousDto, Object currentDto) {
        record(entity, entityId, previousDto, currentDto);
    }

    public void recordDelete(HistoryEntityType entity, Object entityId, Object previousDto) {
        record(entity, entityId, previousDto, null);
    }

    public void record(HistoryEntityType entity, Object entityId, Object previousDto, Object currentDto) {
        Objects.requireNonNull(entity, "history entity must not be null");
        Objects.requireNonNull(entityId, "history entityId must not be null");
        if (previousDto == null && currentDto == null) {
            throw new IllegalArgumentException("history event must contain a previous or current snapshot");
        }

        String entityName = requireText(entity.name(), 32, "history entity");
        String entityIdValue = requireText(String.valueOf(entityId), 64, "history entityId");

        HistoryEntry historyEntry = new HistoryEntry();
        historyEntry.setOccurredAt(Instant.now(clock));
        historyEntry.setEntity(entityName);
        historyEntry.setEntityId(entityIdValue);
        applyActor(historyEntry);

        JsonNode previous = toTree(previousDto);
        JsonNode current = toTree(currentDto);
        HistoryActor actor = historyEntry.getActorLabel() == null
                ? null
                : new HistoryActor(historyEntry.getActorId(), historyEntry.getActorLabel());
        HistoryDataLifecycleDecision decision = java.util.Objects.requireNonNull(
                lifecyclePolicy.classify(new HistoryDataLifecycleContext(
                        historyEntry.getOccurredAt(), actor, entityName, entityIdValue, previous, current)),
                "HistoryDataLifecyclePolicy must return a decision");
        if (decision.retainUntil().isBefore(historyEntry.getOccurredAt())) {
            throw new HistoryDataLifecycleException("History retainUntil must not precede occurredAt.");
        }
        if (previousDto == null && decision.snapshotPrevious() != null
                || previousDto != null && decision.snapshotPrevious() == null
                || currentDto == null && decision.snapshotCurrent() != null
                || currentDto != null && decision.snapshotCurrent() == null) {
            throw new HistoryDataLifecycleException(
                    "History lifecycle redaction must preserve create/update/delete snapshot presence.");
        }
        historyEntry.setLifecyclePartition(decision.partitionKey());
        historyEntry.setRetainUntil(decision.retainUntil());
        historyEntry.setLegalHold(decision.legalHold());
        historyEntry.setSnapshotPrevious(toJson(decision.snapshotPrevious()));
        historyEntry.setSnapshotCurrent(toJson(decision.snapshotCurrent()));

        lifecycleService.store(historyEntry);
    }

    private void applyActor(HistoryEntry historyEntry) {
        actorResolver.resolveCurrentActor().ifPresent(actor -> {
            historyEntry.setActorId(requireOptionalText(actor.id(), 128, "history actor id"));
            historyEntry.setActorLabel(requireText(actor.label(), 100, "history actor label"));
        });
    }

    private JsonNode toTree(Object dto) {
        if (dto == null) {
            return null;
        }
        try {
            return objectMapper.readTree(objectMapper.writeValueAsString(dto));
        } catch (JsonProcessingException exception) {
            throw new HistoryRecordingException(
                    "Failed to serialize history snapshot of type " + dto.getClass().getName(), exception);
        }
    }

    private String toJson(JsonNode snapshot) {
        if (snapshot == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(snapshot);
        } catch (JsonProcessingException exception) {
            throw new HistoryRecordingException("Failed to serialize redacted history snapshot", exception);
        }
    }

    private String requireText(String value, int maxLength, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        String trimmed = value.trim();
        if (trimmed.length() > maxLength) {
            throw new IllegalArgumentException(field + " must not exceed " + maxLength + " characters");
        }
        return trimmed;
    }

    private String requireOptionalText(String value, int maxLength, String field) {
        return value == null ? null : requireText(value, maxLength, field);
    }
}
