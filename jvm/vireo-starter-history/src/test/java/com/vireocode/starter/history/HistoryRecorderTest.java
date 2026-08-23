package com.vireocode.starter.history;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vireocode.starter.base.HistoryEntityType;

@ExtendWith(MockitoExtension.class)
class HistoryRecorderTest {

    private static final Instant NOW = Instant.parse("2026-08-23T06:00:00Z");

    @Mock
    private HistoryRepository repository;

    @Mock
    private ObjectMapper objectMapper;

    @Test
    void record_RejectsMissingIdentityAndSnapshots() {
        HistoryRecorder recorder = recorder(Optional.empty());

        assertThrows(NullPointerException.class, () -> recorder.record(null, "42", null, Map.of()));
        assertThrows(NullPointerException.class,
                () -> recorder.record(TestHistoryEntityType.ITEM, null, null, Map.of()));
        assertThrows(IllegalArgumentException.class,
                () -> recorder.record(TestHistoryEntityType.ITEM, "42", null, null));

        verify(repository, never()).save(any());
    }

    @Test
    void record_WithNoResolvedActor_PersistsSystemActivityWithoutInventingAnActor() throws Exception {
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"value\":1}");
        HistoryRecorder recorder = recorder(Optional.empty());

        recorder.recordCreate(TestHistoryEntityType.ITEM, "1", Map.of("value", 1));

        HistoryEntry saved = captureSavedEntry();
        assertNull(saved.getActorId());
        assertNull(saved.getActorLabel());
        assertEquals(NOW, saved.getOccurredAt());
    }

    @Test
    void record_WithApplicationActor_PersistsNeutralActorAndSerializedSnapshots() throws Exception {
        when(objectMapper.writeValueAsString(any())).thenAnswer(invocation -> "json:" + invocation.getArgument(0));
        HistoryRecorder recorder = recorder(Optional.of(new HistoryActor("user-42", "Demo user")));

        recorder.recordUpdate(
                TestHistoryEntityType.ITEM,
                "2",
                Map.of("before", "x"),
                Map.of("after", "y"));

        HistoryEntry saved = captureSavedEntry();
        assertEquals("user-42", saved.getActorId());
        assertEquals("Demo user", saved.getActorLabel());
        assertEquals("2", saved.getEntityId());
        assertEquals("json:{before=x}", saved.getSnapshotPrevious());
        assertEquals("json:{after=y}", saved.getSnapshotCurrent());
    }

    @Test
    void record_WithSerializationFailure_AbortsInsteadOfPersistingPartialHistory() throws Exception {
        when(objectMapper.writeValueAsString(any()))
                .thenThrow(new JsonProcessingException("boom") {
                    private static final long serialVersionUID = 1L;
                });
        HistoryRecorder recorder = recorder(Optional.empty());

        assertThrows(HistoryRecordingException.class,
                () -> recorder.recordCreate(TestHistoryEntityType.ITEM, "3", Map.of("k", "v")));

        verify(repository, never()).save(any());
    }

    private HistoryRecorder recorder(Optional<HistoryActor> actor) {
        Clock clock = Clock.fixed(NOW, ZoneOffset.UTC);
        return new HistoryRecorder(repository, objectMapper, () -> actor, clock);
    }

    private HistoryEntry captureSavedEntry() {
        ArgumentCaptor<HistoryEntry> captor = ArgumentCaptor.forClass(HistoryEntry.class);
        verify(repository).save(captor.capture());
        return captor.getValue();
    }

    private enum TestHistoryEntityType implements HistoryEntityType {
        ITEM
    }
}
