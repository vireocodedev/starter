package com.vireocode.starter.history;

import java.time.Instant;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vireocode.starter.auth.StarterUserDetails;
import com.vireocode.starter.base.HistoryEntityType;
import com.vireocode.starter.base.HistoryEventsRecorder;

import lombok.extern.slf4j.Slf4j;

/**
 * Central sink for entity change history. Serializes DTO snapshots to JSON and
 * stamps each row with the acting user resolved from the security context.
 */
@Slf4j
public class HistoryRecorder implements HistoryEventsRecorder {

    private static final String SYSTEM_ACTOR = "system";

    private final HistoryRepository repository;
    private final ObjectMapper objectMapper;

    public HistoryRecorder(HistoryRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
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
        if (entity == null || entityId == null) {
            return;
        }

        HistoryEntry historyEntry = new HistoryEntry();
        historyEntry.setOccurredAt(Instant.now());
        historyEntry.setEntity(entity.name());
        historyEntry.setEntityId(String.valueOf(entityId));
        historyEntry.setSnapshotPrevious(toJson(previousDto));
        historyEntry.setSnapshotCurrent(toJson(currentDto));
        applyActor(historyEntry);

        repository.save(historyEntry);
    }

    private void applyActor(HistoryEntry historyEntry) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            historyEntry.setOwnerUsername(SYSTEM_ACTOR);
            return;
        }

        historyEntry.setOwnerUsername(resolveUsername(authentication));

        if (authentication.getPrincipal() instanceof StarterUserDetails userDetails) {
            historyEntry.setOwnerId(userDetails.getId());
        }
    }

    private String resolveUsername(Authentication authentication) {
        String name = authentication.getName();
        return name == null || name.isBlank() ? SYSTEM_ACTOR : name;
    }

    private String toJson(Object dto) {
        if (dto == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(dto);
        } catch (JsonProcessingException exception) {
            log.warn("Failed to serialize history snapshot for {}", dto.getClass().getSimpleName(), exception);
            return null;
        }
    }
}
