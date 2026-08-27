package com.vireocode.vireo.base;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.jpa.domain.Specification;

import com.vireocode.vireo.spi.FilterSpecificationBuilder;
import com.vireocode.vireo.spi.OfflineChangeBroadcaster;
import com.vireocode.vireo.spi.OfflineRevisionTracker;
import com.vireocode.vireo.spi.QueryFilterCriteria;
import com.vireocode.vireo.web.SearchablePageable;

/**
 * Core is published without {@code vireo-query} or
 * {@code vireo-offline} on the compile path, so the only thing holding
 * that promise up at runtime is that {@link BaseService} treats both seams as
 * optional. These tests pin that: a service with no collaborators wired must
 * still read and still publish, silently.
 */
class BaseServiceSeamTest {

    static class Widget extends BaseEntity {
    }

    record WidgetDto(Long id) {
    }

    static class WidgetService extends BaseService<Long, Widget, WidgetDto> {
        WidgetService(SearchableRepository<Widget, Long> repository, BaseMapper<Widget, WidgetDto> mapper) {
            super(repository, mapper);
        }
    }

    @SuppressWarnings("unchecked")
    private WidgetService serviceWithEmptyPage() {
        SearchableRepository<Widget, Long> repository = mock(SearchableRepository.class);
        BaseMapper<Widget, WidgetDto> mapper = mock(BaseMapper.class);
        when(repository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));
        return new WidgetService(repository, mapper);
    }

    @Test
    void findAll_WithNoFilterBuilderOnTheClasspath_RejectsTheFilter() {
        WidgetService service = serviceWithEmptyPage();
        QueryFilterCriteria criteria = new QueryFilterCriteria() {
        };

        IllegalStateException error = assertThrows(IllegalStateException.class,
                () -> service.findAll(new SearchablePageable(Pageable.unpaged(), null), criteria));

        assertThat(error).hasMessageContaining("no FilterSpecificationBuilder bean");
    }

    @Test
    void findAll_WithAFilterBuilderWired_DelegatesToIt() {
        WidgetService service = serviceWithEmptyPage();
        FilterSpecificationBuilder builder = mock(FilterSpecificationBuilder.class);
        when(builder.build(any(), any())).thenReturn((root, query, cb) -> cb.conjunction());
        service.filterSpecificationBuilder = builder;
        QueryFilterCriteria criteria = new QueryFilterCriteria() {
        };

        service.findAll(new SearchablePageable(Pageable.unpaged(), null), criteria);

        verify(builder).build(Widget.class, criteria);
    }

    @Test
    void publishEntityChange_WithNoOfflineModule_DoesNothing() {
        WidgetService service = serviceWithEmptyPage();

        service.publishEntityChange("create", new WidgetDto(1L));
    }

    @Test
    void publishEntityChange_WithOnlyABroadcaster_StillPublishesWithoutARevision() {
        WidgetService service = serviceWithEmptyPage();
        OfflineChangeBroadcaster broadcaster = mock(OfflineChangeBroadcaster.class);
        OfflineRevisionTracker tracker = mock(OfflineRevisionTracker.class);
        service.offlineChangeBroadcaster = broadcaster;
        WidgetDto dto = new WidgetDto(1L);

        service.publishEntityChange("create", dto);

        verify(broadcaster).publishCreateEvent("Widget", dto, null);
        verifyNoInteractions(tracker);
    }

    @Test
    void publishEntityChange_WithBothSeams_CarriesTheBumpedRevision() {
        WidgetService service = serviceWithEmptyPage();
        OfflineChangeBroadcaster broadcaster = mock(OfflineChangeBroadcaster.class);
        OfflineRevisionTracker tracker = mock(OfflineRevisionTracker.class);
        when(tracker.bump(any())).thenReturn(7L);
        service.offlineChangeBroadcaster = broadcaster;
        service.offlineRevisionTracker = tracker;
        WidgetDto dto = new WidgetDto(1L);

        service.publishEntityChange("update", dto);

        verify(broadcaster).publishUpdateEvent("Widget", dto, 7L);
    }
}
