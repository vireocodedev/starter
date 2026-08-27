package com.vireocode.vireo.offline;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

class OfflineEntityVersionServiceTest {

    @Test
    void bump_ReturnsZeroForNullOrBlankEntityKey() {
        OfflineEntityVersionRepository repository = org.mockito.Mockito.mock(OfflineEntityVersionRepository.class);
        OfflineEntityVersionService service = new OfflineEntityVersionService(repository);

        assertEquals(0L, service.bump(null));
        assertEquals(0L, service.bump("   "));

        verify(repository, never()).findByEntityKeyForUpdate(any());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void bump_CreatesAndIncrementsNewEntity() {
        OfflineEntityVersionRepository repository = org.mockito.Mockito.mock(OfflineEntityVersionRepository.class);
        OfflineEntityVersionService service = new OfflineEntityVersionService(repository);

        when(repository.findByEntityKeyForUpdate("widget")).thenReturn(Optional.empty());

        long revision = service.bump(" widget ");

        assertEquals(1L, revision);
        verify(repository).saveAndFlush(any(OfflineEntityVersionEntity.class));
    }

    @Test
    void bump_IncrementsExistingEntity() {
        OfflineEntityVersionRepository repository = org.mockito.Mockito.mock(OfflineEntityVersionRepository.class);
        OfflineEntityVersionService service = new OfflineEntityVersionService(repository);

        OfflineEntityVersionEntity state = new OfflineEntityVersionEntity();
        state.setEntityKey("order");
        state.setRevision(4L);
        when(repository.findByEntityKeyForUpdate("order")).thenReturn(Optional.of(state));

        long revision = service.bump("order");

        assertEquals(5L, revision);
        assertNotNull(state.getChangedAt());
        verify(repository).saveAndFlush(state);
    }

    @Test
    void bump_RetriesOnDataIntegrityViolation_ThenSucceeds() {
        OfflineEntityVersionRepository repository = org.mockito.Mockito.mock(OfflineEntityVersionRepository.class);
        OfflineEntityVersionService service = new OfflineEntityVersionService(repository);

        OfflineEntityVersionEntity state = new OfflineEntityVersionEntity();
        state.setEntityKey("product");
        state.setRevision(1L);

        when(repository.findByEntityKeyForUpdate("product"))
                .thenThrow(new DataIntegrityViolationException("race"))
                .thenReturn(Optional.of(state));

        long revision = service.bump("product");

        assertEquals(2L, revision);
        verify(repository).saveAndFlush(state);
    }

    @Test
    void bump_ThrowsAfterExhaustedRetries() {
        OfflineEntityVersionRepository repository = org.mockito.Mockito.mock(OfflineEntityVersionRepository.class);
        OfflineEntityVersionService service = new OfflineEntityVersionService(repository);

        when(repository.findByEntityKeyForUpdate("company"))
                .thenThrow(new DataIntegrityViolationException("race"));

        assertThrows(DataIntegrityViolationException.class, () -> service.bump("company"));
    }

    @Test
    void getVersions_ReturnsEmptyForNullOrEmptyInput() {
        OfflineEntityVersionRepository repository = org.mockito.Mockito.mock(OfflineEntityVersionRepository.class);
        OfflineEntityVersionService service = new OfflineEntityVersionService(repository);

        assertTrue(service.getVersions(null).isEmpty());
        assertTrue(service.getVersions(List.of()).isEmpty());
    }

    @Test
    void getVersions_NormalizesSkipsDuplicatesAndBuildsFallbacks() {
        OfflineEntityVersionRepository repository = org.mockito.Mockito.mock(OfflineEntityVersionRepository.class);
        OfflineEntityVersionService service = new OfflineEntityVersionService(repository);

        OfflineEntityVersionEntity widgetVersion = new OfflineEntityVersionEntity();
        widgetVersion.setEntityKey("widget");
        widgetVersion.setRevision(3L);
        widgetVersion.setChangedAt(Instant.parse("2026-01-01T10:15:30Z"));

        when(repository.findByEntityKey("widget")).thenReturn(Optional.of(widgetVersion));
        when(repository.findByEntityKey("order")).thenReturn(Optional.empty());

        List<OfflineHydrationEntityVersionDto> versions = service
                .getVersions(List.of(" widget ", "widget", "", "order"));

        assertEquals(2, versions.size());
        assertEquals("widget", versions.get(0).entity());
        assertEquals(3L, versions.get(0).revision());
        assertEquals("order", versions.get(1).entity());
        assertEquals(0L, versions.get(1).revision());
    }

    @Test
    void getVersionSnapshot_UsesCurrentServerTimeAndResolvedVersions() {
        OfflineEntityVersionRepository repository = org.mockito.Mockito.mock(OfflineEntityVersionRepository.class);
        OfflineEntityVersionService service = new OfflineEntityVersionService(repository);

        when(repository.findByEntityKey("product")).thenReturn(Optional.empty());

        OfflineHydrationVersionsResponseDto snapshot = service.getVersionSnapshot(List.of("product"));

        assertNotNull(snapshot.serverTime());
        assertEquals(1, snapshot.versions().size());
        assertEquals("product", snapshot.versions().get(0).entity());
        assertEquals(0L, snapshot.versions().get(0).revision());
    }
}
