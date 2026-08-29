package com.vireocode.vireo.offline;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Method;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpMethod;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.SimpleTransactionStatus;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vireocode.vireo.queryengine.QueryEngineFilterSpecificationBuilder;
import com.vireocode.vireo.queryengine.QueryFilterRequest;
import com.vireocode.vireo.web.SearchablePageable;

class OfflineSyncServiceTest {

    private static final OfflineActor TEST_ACTOR = new OfflineActor(null, "demo", false);
    private static final String TEST_OWNER_KEY = "username:demo";
    private static final String CONCURRENT_REPLAY_MESSAGE_FOR_TEST =
            "Command is already being replayed by a concurrent batch.";

    @Test
    void processBatch_WithEmptyCommands_ReturnsEmptyResponseAndTogglesHeartbeatFlag() {
        OfflineHeartbeatService heartbeatService = org.mockito.Mockito.mock(OfflineHeartbeatService.class);
        OfflineSyncCommandRepository repository = org.mockito.Mockito.mock(OfflineSyncCommandRepository.class);
        OfflineActorResolver actorResolver = org.mockito.Mockito.mock(OfflineActorResolver.class);
        QueryEngineFilterSpecificationBuilder filterBuilder = org.mockito.Mockito
                .mock(QueryEngineFilterSpecificationBuilder.class);

        OfflineSyncService service = serviceWithTransactions(heartbeatService, repository, new ObjectMapper(), actorResolver,
                List.of(), filterBuilder);

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of()),
                new MockHttpServletRequest());

        assertEquals(0, response.accepted());
        assertEquals(0, response.failed());
        verify(heartbeatService, never()).beginSync();
        verify(heartbeatService, never()).endSync();
    }

    @Test
    void processBatch_ReturnsAlreadyProcessedResultForExistingDoneCommand() {
        OfflineSyncService service = newService();
        UUID commandId = UUID.randomUUID();

        OfflineSyncCommandEntity existing = new OfflineSyncCommandEntity();
        existing.setCommandId(commandId);
        existing.setStatus(OfflineSyncCommandStatus.DONE);
        existing.setResponseStatus(null);
        OfflineSyncBatchRequestDto request = new OfflineSyncBatchRequestDto(List.of(
                new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of())));
        bind(existing, request.commands().get(0), service);
        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of(existing));

        OfflineSyncBatchResponseDto response = service.processBatch(request, requestWithBaseUrl());

        assertEquals(1, response.accepted());
        assertEquals(0, response.failed());
        assertTrue(response.results().get(0).success());
        assertEquals(200, response.results().get(0).status());
        assertEquals(OfflineSyncResultReason.ALREADY_APPLIED, response.results().get(0).reason());
        verify(repository(), never()).save(any(OfflineSyncCommandEntity.class));
        verify(repository(), never()).saveAndFlush(any(OfflineSyncCommandEntity.class));
    }

    @Test
    void processBatch_RejectsCommandIdReusedWithDifferentPayload() {
        OfflineSyncService service = newService();
        UUID commandId = UUID.randomUUID();
        OfflineSyncCommandDto original = new OfflineSyncCommandDto(commandId, "POST", "/api/product",
                json("{\"name\":\"original\"}"), Map.of("Idempotency-Key", commandId.toString()));
        OfflineSyncCommandDto changed = new OfflineSyncCommandDto(commandId, "POST", "/api/product",
                json("{\"name\":\"changed\"}"), Map.of("Idempotency-Key", commandId.toString()));

        OfflineSyncCommandEntity existing = new OfflineSyncCommandEntity();
        existing.setCommandId(commandId);
        existing.setStatus(OfflineSyncCommandStatus.DONE);
        bind(existing, original, service);
        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of(existing));

        OfflineSyncBatchResponseDto response = service.processBatch(
                new OfflineSyncBatchRequestDto(List.of(changed)), requestWithBaseUrl());

        assertEquals(0, response.accepted());
        assertEquals(1, response.failed());
        assertEquals(409, response.results().get(0).status());
        assertEquals(OfflineSyncResultReason.REJECTED, response.results().get(0).reason());
        verify(repository(), never()).save(any(OfflineSyncCommandEntity.class));
        verify(repository(), never()).saveAndFlush(any(OfflineSyncCommandEntity.class));
    }

    @Test
    void processBatch_DoesNotExposeAnotherActorsStoredCommand() {
        OfflineSyncService service = newService();
        UUID commandId = UUID.randomUUID();
        OfflineSyncCommandDto command = new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of());

        OfflineSyncCommandEntity anotherActorsCommand = new OfflineSyncCommandEntity();
        anotherActorsCommand.setCommandId(commandId);
        anotherActorsCommand.setOwnerKey("username:other");
        anotherActorsCommand.setStatus(OfflineSyncCommandStatus.DONE);
        anotherActorsCommand.setResponseStatus(201);
        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of(anotherActorsCommand));
        when(repository().saveAndFlush(any(OfflineSyncCommandEntity.class)))
                .thenThrow(new org.springframework.dao.DataIntegrityViolationException("duplicate command_id"));

        OfflineSyncBatchResponseDto response = service.processBatch(
                new OfflineSyncBatchRequestDto(List.of(command)), requestWithBaseUrl());

        assertEquals(409, response.results().get(0).status());
        assertEquals(OfflineSyncResultReason.RETRYABLE, response.results().get(0).reason());
        assertEquals(CONCURRENT_REPLAY_MESSAGE_FOR_TEST, response.results().get(0).error());
    }

    @Test
    void processBatch_RejectsLegacyCommandWithoutPayloadBinding() {
        OfflineSyncService service = newService();
        UUID commandId = UUID.randomUUID();
        OfflineSyncCommandDto command = new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of());

        OfflineSyncCommandEntity existing = new OfflineSyncCommandEntity();
        existing.setCommandId(commandId);
        existing.setOwnerKey(TEST_OWNER_KEY);
        existing.setStatus(OfflineSyncCommandStatus.FAILED);
        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of(existing));

        OfflineSyncBatchResponseDto response = service.processBatch(
                new OfflineSyncBatchRequestDto(List.of(command)), requestWithBaseUrl());

        assertEquals(409, response.results().get(0).status());
        assertEquals(OfflineSyncResultReason.REJECTED, response.results().get(0).reason());
        verify(repository(), never()).save(any(OfflineSyncCommandEntity.class));
    }

    @Test
    void processBatch_RequiresResolvedActor() {
        OfflineSyncService service = newService();
        when(actorResolver().resolveCurrentActor()).thenReturn(Optional.empty());

        org.springframework.web.server.ResponseStatusException exception = org.junit.jupiter.api.Assertions.assertThrows(
                org.springframework.web.server.ResponseStatusException.class,
                () -> service.processBatch(new OfflineSyncBatchRequestDto(List.of(
                        new OfflineSyncCommandDto(UUID.randomUUID(), "POST", "/api/product", null, Map.of()))),
                        requestWithBaseUrl()));

        assertEquals(401, exception.getStatusCode().value());
        verify(repository(), never()).findAllByCommandIdIn(any());
    }

    @Test
    void requestFingerprint_IsStableAcrossJsonObjectFieldOrder() throws Exception {
        OfflineSyncService service = newService();
        UUID commandId = UUID.randomUUID();
        OfflineSyncCommandDto first = new OfflineSyncCommandDto(commandId, "post", "/api/product",
                json("{\"name\":\"Widget\",\"details\":{\"z\":1,\"a\":2}}"), Map.of("X-Trace", "one"));
        OfflineSyncCommandDto reordered = new OfflineSyncCommandDto(commandId, "POST", "/api/product",
                json("{\"details\":{\"a\":2,\"z\":1},\"name\":\"Widget\"}"), Map.of("x-trace", "one"));

        assertEquals(
                invoke(service, "requestFingerprint", new Class<?>[] { OfflineSyncCommandDto.class }, first),
                invoke(service, "requestFingerprint", new Class<?>[] { OfflineSyncCommandDto.class }, reordered));
    }

    @Test
    void processBatch_RetriesExistingFailedCommandOnSameRow() {
        OfflineHeartbeatService heartbeatService = org.mockito.Mockito.mock(OfflineHeartbeatService.class);
        OfflineSyncCommandRepository repository = org.mockito.Mockito.mock(OfflineSyncCommandRepository.class);
        OfflineActorResolver actorResolver = org.mockito.Mockito.mock(OfflineActorResolver.class);
        QueryEngineFilterSpecificationBuilder filterBuilder = org.mockito.Mockito
                .mock(QueryEngineFilterSpecificationBuilder.class);
        OfflineSyncReplayHandler handler = org.mockito.Mockito.mock(OfflineSyncReplayHandler.class);

        UUID commandId = UUID.randomUUID();
        OfflineSyncCommandDto command = new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of());

        OfflineSyncCommandEntity existing = new OfflineSyncCommandEntity();
        existing.setCommandId(commandId);
        existing.setStatus(OfflineSyncCommandStatus.FAILED);
        existing.setResponseStatus(500);
        existing.setErrorMessage("boom");
        existing.setRetryCount(1);

        when(repository.findAllByCommandIdIn(any())).thenReturn(List.of(existing));
        when(actorResolver.resolveCurrentActor()).thenReturn(Optional.of(TEST_ACTOR));
        when(handler.supports(command, HttpMethod.POST)).thenReturn(true);
        when(handler.process(eq(command)))
                .thenReturn(new OfflineSyncCommandResultDto(commandId, true, 200, null));

        OfflineSyncService service = serviceWithTransactions(heartbeatService, repository, new ObjectMapper(),
                actorResolver, List.of(handler), filterBuilder);
        bind(existing, command, service);

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(command)),
                requestWithBaseUrl());

        assertEquals(1, response.accepted());
        assertEquals(0, response.failed());
        assertTrue(response.results().get(0).success());
        assertEquals(OfflineSyncResultReason.APPLIED, response.results().get(0).reason());
        assertEquals(2, existing.getRetryCount());
        assertNull(existing.getErrorMessage());
        verify(repository, org.mockito.Mockito.times(2)).save(existing);
        verify(repository, never()).saveAndFlush(any(OfflineSyncCommandEntity.class));
        verify(handler).process(eq(command));
    }

    @Test
    void processBatch_ResumesAPendingClaimLeftByAProcessFailure() {
        OfflineSyncReplayHandler handler = org.mockito.Mockito.mock(OfflineSyncReplayHandler.class);
        UUID commandId = UUID.randomUUID();
        OfflineSyncCommandDto command = new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of());
        OfflineSyncCommandEntity pending = new OfflineSyncCommandEntity();
        pending.setCommandId(commandId);
        pending.setStatus(OfflineSyncCommandStatus.PENDING);

        OfflineSyncService service = serviceWithTransactions(heartbeatService, repository(), new ObjectMapper(),
                actorResolver(), List.of(handler), queryBuilder());
        bind(pending, command, service);
        when(actorResolver().resolveCurrentActor()).thenReturn(Optional.of(TEST_ACTOR));
        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of(pending));
        when(handler.supports(command, HttpMethod.POST)).thenReturn(true);
        when(handler.process(command)).thenReturn(new OfflineSyncCommandResultDto(commandId, true, 204, null));

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(command)),
                requestWithBaseUrl());

        assertEquals(1, response.accepted());
        assertEquals(1, pending.getRetryCount());
        assertEquals(OfflineSyncCommandStatus.DONE, pending.getStatus());
        assertEquals(204, pending.getResponseStatus());
    }

    @Test
    void processBatch_RejectsExistingFailedCommandWhenRetryBudgetExhausted() {
        OfflineSyncService service = newService();
        UUID commandId = UUID.randomUUID();

        OfflineSyncCommandEntity existing = new OfflineSyncCommandEntity();
        existing.setCommandId(commandId);
        existing.setStatus(OfflineSyncCommandStatus.FAILED);
        existing.setResponseStatus(503);
        existing.setRetryCount(new StarterOfflineProperties().getMaxReplayAttempts());
        OfflineSyncCommandDto command = new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of());
        bind(existing, command, service);
        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of(existing));

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(command)),
                requestWithBaseUrl());

        assertEquals(0, response.accepted());
        assertEquals(1, response.failed());
        assertFalse(response.results().get(0).success());
        assertEquals(503, response.results().get(0).status());
        assertEquals(OfflineSyncResultReason.RETRY_LIMIT_EXCEEDED, response.results().get(0).reason());
        assertEquals(OfflineSyncCommandStatus.REJECTED, existing.getStatus());
        assertNotNull(existing.getProcessedAt());
        assertEquals(new StarterOfflineProperties().getMaxReplayAttempts(), existing.getRetryCount());
        verify(repository()).save(existing);
    }

    @Test
    void processBatch_KeepsExistingRejectedCommandPermanentlyFailed() {
        OfflineSyncService service = newService();
        UUID commandId = UUID.randomUUID();

        OfflineSyncCommandEntity existing = new OfflineSyncCommandEntity();
        existing.setCommandId(commandId);
        existing.setStatus(OfflineSyncCommandStatus.REJECTED);
        existing.setResponseStatus(400);
        existing.setErrorMessage("Unsupported HTTP method.");
        OfflineSyncCommandDto command = new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of());
        bind(existing, command, service);
        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of(existing));

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(command)),
                requestWithBaseUrl());

        assertEquals(0, response.accepted());
        assertEquals(1, response.failed());
        assertFalse(response.results().get(0).success());
        assertEquals(400, response.results().get(0).status());
        assertEquals("Unsupported HTTP method.", response.results().get(0).error());
        assertEquals(OfflineSyncResultReason.REJECTED, response.results().get(0).reason());
        verify(repository(), never()).save(any(OfflineSyncCommandEntity.class));
    }

    @Test
    void processBatch_KeepsExistingRejectedCommandWithoutStoredDetails() {
        OfflineSyncService service = newService();
        UUID commandId = UUID.randomUUID();

        OfflineSyncCommandEntity existing = new OfflineSyncCommandEntity();
        existing.setCommandId(commandId);
        existing.setStatus(OfflineSyncCommandStatus.REJECTED);
        OfflineSyncCommandDto command = new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of());
        bind(existing, command, service);
        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of(existing));

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(command)),
                requestWithBaseUrl());

        assertEquals(422, response.results().get(0).status());
        assertNotNull(response.results().get(0).error());
        assertEquals(OfflineSyncResultReason.REJECTED, response.results().get(0).reason());
    }

    @Test
    void processBatch_CountsMixedResubmissionOutcomes() {
        OfflineSyncService service = newService();

        UUID doneId = UUID.randomUUID();
        UUID rejectedId = UUID.randomUUID();
        UUID exhaustedId = UUID.randomUUID();

        OfflineSyncCommandEntity done = new OfflineSyncCommandEntity();
        done.setCommandId(doneId);
        done.setStatus(OfflineSyncCommandStatus.DONE);
        done.setResponseStatus(201);
        OfflineSyncCommandDto doneCommand = new OfflineSyncCommandDto(doneId, "POST", "/api/product", null, Map.of());
        bind(done, doneCommand, service);

        OfflineSyncCommandEntity rejected = new OfflineSyncCommandEntity();
        rejected.setCommandId(rejectedId);
        rejected.setStatus(OfflineSyncCommandStatus.REJECTED);
        rejected.setResponseStatus(400);
        OfflineSyncCommandDto rejectedCommand = new OfflineSyncCommandDto(rejectedId, "POST", "/api/product", null,
                Map.of());
        bind(rejected, rejectedCommand, service);

        OfflineSyncCommandEntity exhausted = new OfflineSyncCommandEntity();
        exhausted.setCommandId(exhaustedId);
        exhausted.setStatus(OfflineSyncCommandStatus.FAILED);
        exhausted.setRetryCount(new StarterOfflineProperties().getMaxReplayAttempts());
        OfflineSyncCommandDto exhaustedCommand = new OfflineSyncCommandDto(exhaustedId, "POST", "/api/product", null,
                Map.of());
        bind(exhausted, exhaustedCommand, service);

        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of(done, rejected, exhausted));

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(
                doneCommand, rejectedCommand, exhaustedCommand)),
                requestWithBaseUrl());

        assertEquals(1, response.accepted());
        assertEquals(2, response.failed());
        assertEquals(3, response.results().size());
        assertEquals(500, response.results().get(2).status());
    }

    @Test
    void processBatch_WhenConcurrentBatchInsertsSameCommandId_ReturnsRetryableConflict() {
        OfflineSyncService service = newService();
        UUID commandId = UUID.randomUUID();

        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of());
        when(repository().saveAndFlush(any(OfflineSyncCommandEntity.class)))
                .thenThrow(new org.springframework.dao.DataIntegrityViolationException("duplicate command_id"));

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(
                new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of()))),
                requestWithBaseUrl());

        assertEquals(0, response.accepted());
        assertEquals(1, response.failed());
        assertFalse(response.results().get(0).success());
        assertEquals(409, response.results().get(0).status());
        assertEquals(OfflineSyncResultReason.RETRYABLE, response.results().get(0).reason());
        verify(repository(), never()).save(any(OfflineSyncCommandEntity.class));
    }

    @Test
    void processBatch_ConstraintRollbackDoesNotPreventTheNextCommandFromCommitting() {
        OfflineSyncCommandRepository commandRepository = org.mockito.Mockito.mock(OfflineSyncCommandRepository.class);
        OfflineSyncReplayHandler handler = org.mockito.Mockito.mock(OfflineSyncReplayHandler.class);
        PlatformTransactionManager transactionManager = org.mockito.Mockito.mock(PlatformTransactionManager.class);
        AtomicInteger commits = new AtomicInteger();
        AtomicInteger rollbacks = new AtomicInteger();
        when(actorResolver().resolveCurrentActor()).thenReturn(Optional.of(TEST_ACTOR));
        when(commandRepository.findAllByCommandIdIn(any())).thenReturn(List.of());
        when(transactionManager.getTransaction(any())).thenAnswer(invocation -> new SimpleTransactionStatus());
        doAnswer(invocation -> {
            commits.incrementAndGet();
            return null;
        }).when(transactionManager).commit(any());
        doAnswer(invocation -> {
            rollbacks.incrementAndGet();
            return null;
        }).when(transactionManager).rollback(any());

        UUID conflictedId = UUID.randomUUID();
        UUID appliedId = UUID.randomUUID();
        when(commandRepository.saveAndFlush(any(OfflineSyncCommandEntity.class)))
                .thenThrow(new org.springframework.dao.DataIntegrityViolationException("duplicate command_id"))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(commandRepository.save(any(OfflineSyncCommandEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(handler.supports(any(OfflineSyncCommandDto.class), eq(HttpMethod.POST))).thenReturn(true);
        when(handler.process(any(OfflineSyncCommandDto.class))).thenAnswer(invocation -> {
            OfflineSyncCommandDto command = invocation.getArgument(0);
            return new OfflineSyncCommandResultDto(command.commandId(), true, 204, null);
        });
        OfflineSyncService service = new OfflineSyncService(heartbeatService, commandRepository, new ObjectMapper(),
                actorResolver(), List.of(handler), queryBuilder(), transactionManager);

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(
                new OfflineSyncCommandDto(conflictedId, "POST", "/api/orders/conflict", null, Map.of()),
                new OfflineSyncCommandDto(appliedId, "POST", "/api/orders/apply", null, Map.of()))),
                requestWithBaseUrl());

        assertEquals(1, response.accepted());
        assertEquals(1, response.failed());
        assertEquals(OfflineSyncResultReason.RETRYABLE, response.results().get(0).reason());
        assertEquals(OfflineSyncResultReason.APPLIED, response.results().get(1).reason());
        assertEquals(1, rollbacks.get());
        assertEquals(2, commits.get());
        ArgumentCaptor<OfflineSyncCommandEntity> finalized = ArgumentCaptor.forClass(OfflineSyncCommandEntity.class);
        verify(commandRepository).save(finalized.capture());
        assertEquals(appliedId, finalized.getValue().getCommandId());
        assertEquals(OfflineSyncCommandStatus.DONE, finalized.getValue().getStatus());
    }

    @Test
    void processBatch_RejectsNonReplayableUrl() {
        OfflineSyncService service = newService();
        UUID commandId = UUID.randomUUID();

        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of());

        OfflineSyncBatchRequestDto request = new OfflineSyncBatchRequestDto(List.of(
                new OfflineSyncCommandDto(commandId, "POST", "/healthz", null, Map.of())));

        OfflineSyncBatchResponseDto response = service.processBatch(request, requestWithBaseUrl());

        assertEquals(0, response.accepted());
        assertEquals(1, response.failed());
        assertFalse(response.results().get(0).success());
        assertEquals(400, response.results().get(0).status());
        assertEquals(OfflineSyncResultReason.REJECTED, response.results().get(0).reason());

        ArgumentCaptor<OfflineSyncCommandEntity> captor = ArgumentCaptor.forClass(OfflineSyncCommandEntity.class);
        verify(repository(), atLeastOnce()).save(captor.capture());
        OfflineSyncCommandEntity saved = captor.getValue();
        assertEquals(OfflineSyncCommandStatus.REJECTED, saved.getStatus());
        assertEquals(400, saved.getResponseStatus());
        assertNotNull(saved.getProcessedAt());
    }

    @Test
        void processBatch_WithInvalidMethodShape_ReturnsFailure() {
        OfflineSyncService service = newService();
        UUID commandId = UUID.randomUUID();

        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of());

        OfflineSyncBatchRequestDto request = new OfflineSyncBatchRequestDto(List.of(
                new OfflineSyncCommandDto(commandId, "TRACEZ", "/api/product", null, Map.of())));

        OfflineSyncBatchResponseDto response = service.processBatch(request, requestWithBaseUrl());

        assertEquals(0, response.accepted());
        assertEquals(1, response.failed());
        assertFalse(response.results().get(0).success());
        assertEquals(400, response.results().get(0).status());

        ArgumentCaptor<OfflineSyncCommandEntity> captor = ArgumentCaptor.forClass(OfflineSyncCommandEntity.class);
        verify(repository(), atLeastOnce()).save(captor.capture());
        OfflineSyncCommandEntity saved = captor.getValue();
        assertEquals(OfflineSyncCommandStatus.REJECTED, saved.getStatus());
    }

    @Test
    void processBatch_UsesReplayHandlerWhenSupported() {
        OfflineHeartbeatService heartbeatService = org.mockito.Mockito.mock(OfflineHeartbeatService.class);
        OfflineSyncCommandRepository repository = org.mockito.Mockito.mock(OfflineSyncCommandRepository.class);
        OfflineActorResolver actorResolver = org.mockito.Mockito.mock(OfflineActorResolver.class);
        QueryEngineFilterSpecificationBuilder filterBuilder = org.mockito.Mockito
                .mock(QueryEngineFilterSpecificationBuilder.class);
        OfflineSyncReplayHandler handler = org.mockito.Mockito.mock(OfflineSyncReplayHandler.class);

        UUID commandId = UUID.randomUUID();
        OfflineSyncCommandDto command = new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of());

        when(repository.findAllByCommandIdIn(any())).thenReturn(List.of());
        when(actorResolver.resolveCurrentActor()).thenReturn(Optional.of(TEST_ACTOR));
        when(handler.supports(command, HttpMethod.POST)).thenReturn(true);
        when(handler.process(eq(command)))
                .thenReturn(new OfflineSyncCommandResultDto(commandId, true, 201, null));

        OfflineSyncService service = serviceWithTransactions(heartbeatService, repository, new ObjectMapper(), actorResolver,
                List.of(handler), filterBuilder);

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(command)),
                requestWithBaseUrl());

        assertEquals(1, response.accepted());
        assertEquals(0, response.failed());
        assertEquals(201, response.results().get(0).status());
    }

    @Test
    void processBatch_RejectsValidCommandWithoutAnApplicationReplayHandler() {
        OfflineSyncService service = newService();
        UUID commandId = UUID.randomUUID();
        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of());

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(
                new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of()))),
                requestWithBaseUrl());

        assertEquals(0, response.accepted());
        assertEquals(422, response.results().get(0).status());
        assertEquals(OfflineSyncResultReason.REJECTED, response.results().get(0).reason());
        ArgumentCaptor<OfflineSyncCommandEntity> saved = ArgumentCaptor.forClass(OfflineSyncCommandEntity.class);
        verify(repository(), atLeastOnce()).save(saved.capture());
        assertEquals(OfflineSyncCommandStatus.REJECTED, saved.getValue().getStatus());
    }

    @Test
    void processBatch_WhenReplayHandlerThrows_ReturnsFailed500() {
        OfflineHeartbeatService heartbeatService = org.mockito.Mockito.mock(OfflineHeartbeatService.class);
        OfflineSyncCommandRepository repository = org.mockito.Mockito.mock(OfflineSyncCommandRepository.class);
        OfflineActorResolver actorResolver = org.mockito.Mockito.mock(OfflineActorResolver.class);
        QueryEngineFilterSpecificationBuilder filterBuilder = org.mockito.Mockito
                .mock(QueryEngineFilterSpecificationBuilder.class);
        OfflineSyncReplayHandler handler = org.mockito.Mockito.mock(OfflineSyncReplayHandler.class);

        UUID commandId = UUID.randomUUID();
        OfflineSyncCommandDto command = new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of());

        when(repository.findAllByCommandIdIn(any())).thenReturn(List.of());
        when(actorResolver.resolveCurrentActor()).thenReturn(Optional.of(TEST_ACTOR));
        when(handler.supports(command, HttpMethod.POST)).thenReturn(true);
        when(handler.process(eq(command))).thenThrow(new RuntimeException("boom"));

        OfflineSyncService service = serviceWithTransactions(heartbeatService, repository, new ObjectMapper(), actorResolver,
                List.of(handler), filterBuilder);

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(command)),
                requestWithBaseUrl());

        assertEquals(0, response.accepted());
        assertEquals(1, response.failed());
        assertEquals(500, response.results().get(0).status());
        assertEquals("Command replay failed.", response.results().get(0).error());
    }

    @Test
    @SuppressWarnings("unchecked")
    void processBatch_UsesIndependentTransactionsAndNeverDispatchesRequestCredentialsOrHost() {
        OfflineHeartbeatService heartbeat = org.mockito.Mockito.mock(OfflineHeartbeatService.class);
        OfflineSyncCommandRepository commandRepository = org.mockito.Mockito.mock(OfflineSyncCommandRepository.class);
        OfflineActorResolver resolver = org.mockito.Mockito.mock(OfflineActorResolver.class);
        QueryEngineFilterSpecificationBuilder filterBuilder = org.mockito.Mockito
                .mock(QueryEngineFilterSpecificationBuilder.class);
        OfflineSyncReplayHandler handler = org.mockito.Mockito.mock(OfflineSyncReplayHandler.class);
        PlatformTransactionManager transactionManager = org.mockito.Mockito.mock(PlatformTransactionManager.class);
        AtomicInteger commits = new AtomicInteger();
        Map<UUID, OfflineSyncCommandEntity> persisted = new HashMap<>();

        when(resolver.resolveCurrentActor()).thenReturn(Optional.of(TEST_ACTOR));
        when(transactionManager.getTransaction(any())).thenAnswer(invocation -> new SimpleTransactionStatus());
        doAnswer(invocation -> {
            commits.incrementAndGet();
            return null;
        }).when(transactionManager).commit(any());
        when(commandRepository.findAllByCommandIdIn(any())).thenAnswer(invocation -> {
            Collection<UUID> ids = invocation.getArgument(0);
            return ids.stream().map(persisted::get).filter(java.util.Objects::nonNull).toList();
        });
        when(commandRepository.saveAndFlush(any(OfflineSyncCommandEntity.class))).thenAnswer(invocation -> {
            OfflineSyncCommandEntity entity = invocation.getArgument(0);
            persisted.put(entity.getCommandId(), entity);
            return entity;
        });
        when(commandRepository.save(any(OfflineSyncCommandEntity.class))).thenAnswer(invocation -> {
            OfflineSyncCommandEntity entity = invocation.getArgument(0);
            persisted.put(entity.getCommandId(), entity);
            return entity;
        });
        when(handler.supports(any(OfflineSyncCommandDto.class), eq(HttpMethod.POST))).thenReturn(true);
        when(handler.process(any(OfflineSyncCommandDto.class))).thenAnswer(invocation -> {
            OfflineSyncCommandDto command = invocation.getArgument(0);
            if (command.url().endsWith("/fail")) {
                assertEquals(1, commits.get(), "the claim must commit before application dispatch");
                throw new IllegalStateException("domain conflict");
            }
            assertEquals(3, commits.get(), "the previous finalize and this claim must commit independently");
            assertEquals(Map.of("Idempotency-Key", "safe"), command.headers());
            return new OfflineSyncCommandResultDto(command.commandId(), true, 204, null);
        });

        OfflineSyncService service = new OfflineSyncService(heartbeat, commandRepository, new ObjectMapper(), resolver,
                List.of(handler), filterBuilder, transactionManager);
        UUID failedId = UUID.randomUUID();
        UUID appliedId = UUID.randomUUID();
        OfflineSyncBatchRequestDto batch = new OfflineSyncBatchRequestDto(List.of(
                new OfflineSyncCommandDto(failedId, "POST", "/api/orders/fail", null,
                        Map.of("Cookie", "queued-secret", "Host", "queued.example", "Idempotency-Key", "safe")),
                new OfflineSyncCommandDto(appliedId, "POST", "/api/orders/apply", null,
                        Map.of("Cookie", "queued-secret", "Idempotency-Key", "safe"))));
        MockHttpServletRequest request = requestWithBaseUrl();
        request.setServerName("attacker.example");
        request.addHeader("Host", "attacker.example");
        request.addHeader("Cookie", "SESSION=incoming-secret");
        request.addHeader("X-XSRF-TOKEN", "incoming-xsrf");

        OfflineSyncBatchResponseDto response = service.processBatch(batch, request);

        assertEquals(1, response.accepted());
        assertEquals(1, response.failed());
        assertEquals(OfflineSyncResultReason.RETRYABLE, response.results().get(0).reason());
        assertEquals(OfflineSyncResultReason.APPLIED, response.results().get(1).reason());
        assertEquals(OfflineSyncCommandStatus.FAILED, persisted.get(failedId).getStatus());
        assertEquals(OfflineSyncCommandStatus.DONE, persisted.get(appliedId).getStatus());
        assertEquals(4, commits.get());
        assertFalse(java.util.Arrays.stream(OfflineSyncService.class.getDeclaredFields())
                .anyMatch(field -> field.getType().getName().contains("RestClient")));
    }

    @Test
    void searchCommands_ThrowsUnauthorizedWhenActorMissing() {
        OfflineSyncService service = newService();
        when(actorResolver().resolveCurrentActor()).thenReturn(Optional.empty());

        org.springframework.web.server.ResponseStatusException exception = org.junit.jupiter.api.Assertions
                .assertThrows(org.springframework.web.server.ResponseStatusException.class,
                        () -> service.searchCommands(new SearchablePageable(org.springframework.data.domain.PageRequest.of(0, 10),
                                null), null));

        assertEquals(401, exception.getStatusCode().value());
    }

    @Test
    void searchCommands_AppliesSearchAndFiltersAndMapsRows() {
        OfflineSyncService service = newService();

        when(actorResolver().resolveCurrentActor()).thenReturn(Optional.of(new OfflineActor(UUID.randomUUID(), "demo", false)));
        when(queryBuilder().build(eq(OfflineSyncCommandEntity.class), any(QueryFilterRequest.class)))
                .thenReturn((root, query, criteriaBuilder) -> criteriaBuilder.conjunction());

        OfflineSyncCommandEntity row = new OfflineSyncCommandEntity();
        row.setCommandId(UUID.randomUUID());
        row.setHttpMethod("POST");
        row.setUrl("/api/product");
        row.setRequestBody("{}");
        row.setStatus(OfflineSyncCommandStatus.DONE);
        row.setResponseStatus(200);

        when(repository().findAll(
                org.mockito.ArgumentMatchers.<org.springframework.data.jpa.domain.Specification<OfflineSyncCommandEntity>>any(),
                any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(row)));

        org.springframework.data.domain.Page<OfflineSyncCommandListItemDto> page = service.searchCommands(
                new SearchablePageable(org.springframework.data.domain.PageRequest.of(0, 10), "prod"),
                new QueryFilterRequest("OfflineSyncCommand", "group", List.of()));

        assertEquals(1, page.getTotalElements());
        assertEquals("POST", page.getContent().get(0).httpMethod());
        verify(queryBuilder()).build(eq(OfflineSyncCommandEntity.class), any(QueryFilterRequest.class));
    }

    @Test
    void privateHelpers_ValidateReplayableUrlAndToJsonFallback() throws Exception {
        OfflineHeartbeatService heartbeatService = org.mockito.Mockito.mock(OfflineHeartbeatService.class);
        OfflineSyncCommandRepository repository = org.mockito.Mockito.mock(OfflineSyncCommandRepository.class);
        OfflineActorResolver actorResolver = org.mockito.Mockito.mock(OfflineActorResolver.class);
        QueryEngineFilterSpecificationBuilder filterBuilder = org.mockito.Mockito
                .mock(QueryEngineFilterSpecificationBuilder.class);
        ObjectMapper mapper = org.mockito.Mockito.mock(ObjectMapper.class);

        when(mapper.writeValueAsString(any())).thenThrow(new JsonProcessingException("x") {
            private static final long serialVersionUID = 1L;
        });

        OfflineSyncService service = serviceWithTransactions(heartbeatService, repository, mapper, actorResolver,
                List.of(), filterBuilder);

        assertTrue((Boolean) invoke(service, "isReplayableApiUrl", new Class<?>[] { String.class }, "/api/product"));
        assertFalse((Boolean) invoke(service, "isReplayableApiUrl", new Class<?>[] { String.class }, "/api/offline/sync"));
        assertFalse((Boolean) invoke(service, "isReplayableApiUrl", new Class<?>[] { String.class },
                "/api/%2e%2e/auth/login"));
        assertFalse((Boolean) invoke(service, "isReplayableApiUrl", new Class<?>[] { String.class },
                "https://example.org/api/product"));
        assertFalse((Boolean) invoke(service, "isReplayableApiUrl", new Class<?>[] { String.class }, " "));

        assertNull(invoke(service, "toJson", new Class<?>[] { Object.class }, new Object[] { null }));
        String fallback = (String) invoke(service, "toJson", new Class<?>[] { Object.class }, new Object[] { new Object() {
            @Override
            public String toString() {
                return "fallback";
            }
        } });
        assertEquals("fallback", fallback);
    }

    @Test
    void privateHelper_NewCommandEntity_BindsResolvedActorAndPayload() throws Exception {
        OfflineSyncService service = newService();
        OfflineActor identifiedActor = new OfflineActor(
                UUID.fromString("11111111-1111-1111-1111-111111111111"), "demo", false);

        UUID firstId = UUID.randomUUID();
        OfflineSyncCommandDto first = new OfflineSyncCommandDto(firstId, "post", "/api/p", null, Map.of("k", "v"));
        OfflineSyncCommandEntity firstEntity = (OfflineSyncCommandEntity) invoke(service, "newCommandEntity",
                new Class<?>[] { OfflineSyncCommandDto.class, OfflineActor.class, String.class }, first,
                identifiedActor, "id:" + identifiedActor.id());

        assertEquals(firstId, firstEntity.getCommandId());
        assertEquals("POST", firstEntity.getHttpMethod());
        assertEquals("demo", firstEntity.getOwnerUsername());
        assertNotNull(firstEntity.getOwnerId());
        assertEquals("id:" + identifiedActor.id(), firstEntity.getOwnerKey());
        assertEquals(64, firstEntity.getRequestFingerprint().length());

        OfflineSyncCommandDto second = new OfflineSyncCommandDto(UUID.randomUUID(), "get", "/api/p", null, Map.of());
        OfflineSyncCommandEntity secondEntity = (OfflineSyncCommandEntity) invoke(service, "newCommandEntity",
                new Class<?>[] { OfflineSyncCommandDto.class, OfflineActor.class, String.class }, second,
                TEST_ACTOR, TEST_OWNER_KEY);
        assertEquals("demo", secondEntity.getOwnerUsername());
        assertNull(secondEntity.getOwnerId());
        assertEquals(TEST_OWNER_KEY, secondEntity.getOwnerKey());
    }

    private final OfflineHeartbeatService heartbeatService = org.mockito.Mockito.mock(OfflineHeartbeatService.class);
    private final OfflineSyncCommandRepository repository = org.mockito.Mockito.mock(OfflineSyncCommandRepository.class);
    private final OfflineActorResolver actorResolver = org.mockito.Mockito.mock(OfflineActorResolver.class);
    private final QueryEngineFilterSpecificationBuilder queryBuilder = org.mockito.Mockito
            .mock(QueryEngineFilterSpecificationBuilder.class);

    private OfflineSyncService newService() {
        when(actorResolver.resolveCurrentActor()).thenReturn(Optional.of(TEST_ACTOR));
        return serviceWithTransactions(heartbeatService, repository, new ObjectMapper(), actorResolver, List.of(),
                queryBuilder);
    }

    private OfflineSyncService serviceWithTransactions(OfflineHeartbeatService heartbeat,
            OfflineSyncCommandRepository commandRepository, ObjectMapper mapper, OfflineActorResolver resolver,
            List<OfflineSyncReplayHandler> handlers, QueryEngineFilterSpecificationBuilder filterBuilder) {
        PlatformTransactionManager transactionManager = org.mockito.Mockito.mock(PlatformTransactionManager.class);
        when(transactionManager.getTransaction(any())).thenAnswer(invocation -> new SimpleTransactionStatus());
        return new OfflineSyncService(heartbeat, commandRepository, mapper, resolver, handlers, filterBuilder,
                transactionManager);
    }

    private void bind(OfflineSyncCommandEntity entity, OfflineSyncCommandDto command, OfflineSyncService service) {
        entity.setOwnerKey(TEST_OWNER_KEY);
        try {
            entity.setRequestFingerprint((String) invoke(service, "requestFingerprint",
                    new Class<?>[] { OfflineSyncCommandDto.class }, command));
        } catch (Exception ex) {
            throw new AssertionError(ex);
        }
    }

    private com.fasterxml.jackson.databind.JsonNode json(String value) {
        try {
            return new ObjectMapper().readTree(value);
        } catch (JsonProcessingException ex) {
            throw new AssertionError(ex);
        }
    }

    private OfflineSyncCommandRepository repository() {
        return repository;
    }

    private OfflineActorResolver actorResolver() {
        return actorResolver;
    }

    private QueryEngineFilterSpecificationBuilder queryBuilder() {
        return queryBuilder;
    }

    private MockHttpServletRequest requestWithBaseUrl() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setScheme("http");
        request.setServerName("localhost");
        request.setServerPort(8080);
        request.setRequestURI("/api/offline/sync");
        return request;
    }

    private Object invoke(Object target, String methodName, Class<?>[] paramTypes, Object... args) throws Exception {
        Method method = target.getClass().getDeclaredMethod(methodName, paramTypes);
        method.setAccessible(true);
        return method.invoke(target, args);
    }
}
