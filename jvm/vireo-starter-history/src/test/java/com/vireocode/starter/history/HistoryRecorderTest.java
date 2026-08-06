package com.vireocode.starter.history;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vireocode.starter.base.HistoryEntityType;
import com.vireocode.starter.auth.StarterUser;
import com.vireocode.starter.auth.StarterUserDetails;

@ExtendWith(MockitoExtension.class)
class HistoryRecorderTest {

    @Mock
    private HistoryRepository repository;

    @Mock
    private ObjectMapper objectMapper;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void record_WithNullEntity_DoesNotPersist() {
        HistoryRecorder recorder = new HistoryRecorder(repository, objectMapper);

        recorder.record(null, "42", null, null);

        verify(repository, never()).save(any());
    }

    @Test
    void record_WithNullEntityId_DoesNotPersist() {
        HistoryRecorder recorder = new HistoryRecorder(repository, objectMapper);

        recorder.record(TestHistoryEntityType.ITEM, null, null, null);

        verify(repository, never()).save(any());
    }

    @Test
    void record_WithAnonymousAuthentication_SetsSystemActor() {
        HistoryRecorder recorder = new HistoryRecorder(repository, objectMapper);
        SecurityContextHolder.getContext().setAuthentication(new AnonymousAuthenticationToken(
                "key",
                "anonymousUser",
                List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"))));

        recorder.record(TestHistoryEntityType.ITEM, "1", null, null);

        ArgumentCaptor<HistoryEntry> captor = ArgumentCaptor.forClass(HistoryEntry.class);
        verify(repository).save(captor.capture());
        HistoryEntry saved = captor.getValue();

        assertEquals("system", saved.getOwnerUsername());
        assertNull(saved.getOwnerId());
        assertNotNull(saved.getOccurredAt());
    }

    @Test
    void record_WithBlankAuthenticationName_UsesSystemActor() {
        HistoryRecorder recorder = new HistoryRecorder(repository, objectMapper);
        var authentication = UsernamePasswordAuthenticationToken.authenticated(
                "   ",
                "ignored",
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        recorder.record(TestHistoryEntityType.ITEM, "1", null, null);

        ArgumentCaptor<HistoryEntry> captor = ArgumentCaptor.forClass(HistoryEntry.class);
        verify(repository).save(captor.capture());
        HistoryEntry saved = captor.getValue();

        assertEquals("system", saved.getOwnerUsername());
        assertNull(saved.getOwnerId());
    }

    @Test
    void record_WithAppUserPrincipal_SetsOwnerIdAndSerializedSnapshots() throws Exception {
        UUID userId = UUID.randomUUID();
        StarterUser user = new StarterUser(userId, "demo", "hash", "SUPERADMIN", true);
        StarterUserDetails userDetails = new StarterUserDetails(user);
        var authentication = UsernamePasswordAuthenticationToken.authenticated(
                userDetails,
                "ignored",
                userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(objectMapper.writeValueAsString(any())).thenAnswer(invocation -> "json:" + invocation.getArgument(0));

        HistoryRecorder recorder = new HistoryRecorder(repository, objectMapper);
        recorder.recordUpdate(
                TestHistoryEntityType.ITEM,
                "2",
                Map.of("before", "x"),
                Map.of("after", "y"));

        ArgumentCaptor<HistoryEntry> captor = ArgumentCaptor.forClass(HistoryEntry.class);
        verify(repository).save(captor.capture());
        HistoryEntry saved = captor.getValue();

        assertEquals("demo", saved.getOwnerUsername());
        assertEquals(userId, saved.getOwnerId());
        assertEquals("2", saved.getEntityId());
        assertNotNull(saved.getSnapshotPrevious());
        assertNotNull(saved.getSnapshotCurrent());
    }

    @Test
    void record_WithSerializationFailure_StoresNullSnapshots() throws Exception {
        when(objectMapper.writeValueAsString(any()))
                .thenThrow(new JsonProcessingException("boom") {
                    private static final long serialVersionUID = 1L;
                });

        HistoryRecorder recorder = new HistoryRecorder(repository, objectMapper);
        recorder.recordCreate(TestHistoryEntityType.ITEM, "3", Map.of("k", "v"));

        ArgumentCaptor<HistoryEntry> captor = ArgumentCaptor.forClass(HistoryEntry.class);
        verify(repository).save(captor.capture());
        HistoryEntry saved = captor.getValue();

        assertNull(saved.getSnapshotCurrent());
    }

    /**
     * The library owns the history table but not the set of values that may
     * appear in its entity column; a consumer supplies its own implementation.
     */
    private enum TestHistoryEntityType implements HistoryEntityType {
        ITEM
    }
}
