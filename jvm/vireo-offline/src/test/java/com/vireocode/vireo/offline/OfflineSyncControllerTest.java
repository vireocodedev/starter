package com.vireocode.vireo.offline;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Sort;
import org.springframework.mock.web.MockHttpServletRequest;

import com.vireocode.vireo.queryengine.QueryFilterRequest;
import com.vireocode.vireo.web.SearchablePageable;

class OfflineSyncControllerTest {

    @Test
    void sync_DelegatesToService() {
        OfflineSyncService service = org.mockito.Mockito.mock(OfflineSyncService.class);
        OfflineSyncController controller = new OfflineSyncController(service);

        UUID commandId = UUID.randomUUID();
        OfflineSyncBatchRequestDto request = new OfflineSyncBatchRequestDto(List.of(
                new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of())));
        MockHttpServletRequest servletRequest = new MockHttpServletRequest();

        OfflineSyncBatchResponseDto expected = new OfflineSyncBatchResponseDto(1, 0,
                List.of(new OfflineSyncCommandResultDto(commandId, true, 200, null)));
        when(service.processBatch(request, servletRequest)).thenReturn(expected);

        OfflineSyncBatchResponseDto actual = controller.sync(request, servletRequest);

        assertSame(expected, actual);
    }

    @Test
    void searchCommands_NormalizesSupportedSortFieldsAndFallsBackToCreatedAt() {
        OfflineSyncService service = org.mockito.Mockito.mock(OfflineSyncService.class);
        OfflineSyncController controller = new OfflineSyncController(service);

        Page<OfflineSyncCommandListItemDto> emptyPage = new PageImpl<>(List.of());
        when(service.searchCommands(any(SearchablePageable.class), any(QueryFilterRequest.class))).thenReturn(emptyPage);

        assertSortBy(controller, service, "responseStatus", "responseStatus");
        assertSortBy(controller, service, "processedAt", "processedAt");
        assertSortBy(controller, service, "httpMethod", "httpMethod");
        assertSortBy(controller, service, "url", "url");
        assertSortBy(controller, service, "status", "status");
        assertSortBy(controller, service, "ownerUsername", "ownerUsername");
        assertSortBy(controller, service, "somethingElse", "createdAt");
    }

    private void assertSortBy(OfflineSyncController controller, OfflineSyncService service, String requestedSort,
            String expectedSort) {
        QueryFilterRequest filters = new QueryFilterRequest("OfflineSyncCommand", "group", List.of());

        controller.searchCommands(2, 15, requestedSort, "asc", "needle", filters);

        ArgumentCaptor<SearchablePageable> pageableCaptor = ArgumentCaptor.forClass(SearchablePageable.class);
        verify(service, org.mockito.Mockito.atLeastOnce()).searchCommands(pageableCaptor.capture(), any());

        SearchablePageable captured = pageableCaptor.getValue();
        Sort.Order order = captured.getPageable().getSort().stream().findFirst().orElseThrow();
        assertEquals(expectedSort, order.getProperty());
        assertEquals(Sort.Direction.ASC, order.getDirection());
        assertEquals("needle", captured.getSearchText());
    }
}
