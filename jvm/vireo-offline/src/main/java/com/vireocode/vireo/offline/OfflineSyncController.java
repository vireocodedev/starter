package com.vireocode.vireo.offline;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vireocode.vireo.web.SearchablePageable;
import com.vireocode.vireo.security.SecurityExpressions;
import com.vireocode.vireo.web.RestUtils;
import com.vireocode.vireo.queryengine.QueryFilterRequest;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("${vireo.starter.offline.sync-endpoint-path:/api/offline/sync}")
@Validated
public class OfflineSyncController {

    private final OfflineSyncService offlineSyncService;

    public OfflineSyncController(OfflineSyncService offlineSyncService) {
        this.offlineSyncService = offlineSyncService;
    }

    @PostMapping
    @PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
    public OfflineSyncBatchResponseDto sync(@Valid @RequestBody OfflineSyncBatchRequestDto request,
            HttpServletRequest httpServletRequest) {
        return offlineSyncService.processBatch(request, httpServletRequest);
    }

    @PostMapping("/commands/search")
    @PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
    public Page<OfflineSyncCommandListItemDto> searchCommands(
            @RequestParam(defaultValue = "0", name = "page") int page,
            @RequestParam(defaultValue = "10", name = "rowsPerPage") int rowsPerPage,
            @RequestParam(defaultValue = "createdAt", name = "sortBy") String sortBy,
            @RequestParam(defaultValue = "desc", name = "sortDirection") String sortDirection,
            @RequestParam(required = false, name = "searchText") String searchText,
            @RequestBody(required = false) QueryFilterRequest filters) {
        SearchablePageable pageable = RestUtils.makePageable(page, rowsPerPage, normalizeSortBy(sortBy), sortDirection,
                searchText);
        return offlineSyncService.searchCommands(pageable, filters);
    }

    private String normalizeSortBy(String sortBy) {
        if ("responseStatus".equals(sortBy)) {
            return "responseStatus";
        }

        if ("processedAt".equals(sortBy)) {
            return "processedAt";
        }

        if ("httpMethod".equals(sortBy)) {
            return "httpMethod";
        }

        if ("url".equals(sortBy)) {
            return "url";
        }

        if ("status".equals(sortBy)) {
            return "status";
        }

        if ("ownerUsername".equals(sortBy)) {
            return "ownerUsername";
        }

        return "createdAt";
    }
}
