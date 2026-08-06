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

import com.vireocode.starter.security.SecurityExpressions;
import com.vireocode.starter.web.RestUtils;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/history")
@Tag(name = "History")
@Slf4j
@PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
public class HistoryController {

    /**
     * Applied when the caller omits {@code limit}, preserving the pre-existing
     * unbounded-looking response shape for the vast majority of entities while
     * still protecting against unbounded history growth.
     */
    private static final int DEFAULT_LIMIT = 200;

    /**
     * Hard ceiling regardless of what the caller requests via {@code limit}.
     */
    private static final int MAX_LIMIT = 500;

    private final HistoryRepository repository;

    public HistoryController(HistoryRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<HistoryEntryDTO> find(@RequestParam("entity") String entity,
            @RequestParam("entityId") String entityId,
            @RequestParam(value = "limit", required = false) String limitParam) {
        int limit = resolveLimit(limitParam);
        Pageable mostRecentFirst = PageRequest.of(0, limit);

        List<HistoryEntry> mostRecentDescending = repository
                .findByEntityAndEntityIdOrderByOccurredAtDesc(entity, entityId, mostRecentFirst);

        List<HistoryEntry> ascending = new ArrayList<>(mostRecentDescending);
        Collections.reverse(ascending);

        return ascending.stream()
                .map(this::toDto)
                .toList();
    }

    private int resolveLimit(String limitParam) {
        if (limitParam == null || limitParam.isBlank()) {
            return DEFAULT_LIMIT;
        }

        int requestedLimit;
        try {
            requestedLimit = Integer.parseInt(limitParam.trim());
        } catch (NumberFormatException exception) {
            throw RestUtils.badRequest("limit must be a positive integer");
        }

        if (requestedLimit <= 0) {
            throw RestUtils.badRequest("limit must be a positive integer");
        }

        return Math.min(requestedLimit, MAX_LIMIT);
    }

    private HistoryEntryDTO toDto(HistoryEntry entry) {
        HistoryEntryDTO dto = new HistoryEntryDTO();
        dto.setId(entry.getId());
        dto.setTimestamp(entry.getOccurredAt());
        dto.setOwnerId(entry.getOwnerId());
        dto.setOwnerUsername(entry.getOwnerUsername());
        dto.setEntity(entry.getEntity());
        dto.setEntityId(entry.getEntityId());
        dto.setSnapshotPrevious(entry.getSnapshotPrevious());
        dto.setSnapshotCurrent(entry.getSnapshotCurrent());
        return dto;
    }
}
