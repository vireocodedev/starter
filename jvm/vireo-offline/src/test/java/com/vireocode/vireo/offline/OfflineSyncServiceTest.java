package com.vireocode.vireo.offline;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.mock.web.MockHttpServletRequest;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vireocode.vireo.queryengine.QueryEngineFilterSpecificationBuilder;
import com.vireocode.vireo.queryengine.QueryFilterRequest;
import com.vireocode.vireo.web.SearchablePageable;

class OfflineSyncServiceTest {

    @Test
    void processBatch_WithEmptyCommands_ReturnsEmptyResponseAndTogglesHeartbeatFlag() {
        OfflineHeartbeatService heartbeatService = org.mockito.Mockito.mock(OfflineHeartbeatService.class);
        OfflineSyncCommandRepository repository = org.mockito.Mockito.mock(OfflineSyncCommandRepository.class);
        OfflineActorResolver actorResolver = org.mockito.Mockito.mock(OfflineActorResolver.class);
        QueryEngineFilterSpecificationBuilder filterBuilder = org.mockito.Mockito
                .mock(QueryEngineFilterSpecificationBuilder.class);

        OfflineSyncService service = new OfflineSyncService(heartbeatService, repository, new ObjectMapper(), actorResolver,
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
        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of(existing));

        OfflineSyncBatchRequestDto request = new OfflineSyncBatchRequestDto(List.of(
                new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of())));

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
        when(handler.supports(command, HttpMethod.POST)).thenReturn(true);
        when(handler.process(eq(command)))
                .thenReturn(new OfflineSyncCommandResultDto(commandId, true, 200, null));

        OfflineSyncService service = new OfflineSyncService(heartbeatService, repository, new ObjectMapper(),
                actorResolver, List.of(handler), filterBuilder);

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
    void processBatch_RejectsExistingFailedCommandWhenRetryBudgetExhausted() {
        OfflineSyncService service = newService();
        UUID commandId = UUID.randomUUID();

        OfflineSyncCommandEntity existing = new OfflineSyncCommandEntity();
        existing.setCommandId(commandId);
        existing.setStatus(OfflineSyncCommandStatus.FAILED);
        existing.setResponseStatus(503);
        existing.setRetryCount(new StarterOfflineProperties().getMaxReplayAttempts());
        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of(existing));

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(
                new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of()))),
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
        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of(existing));

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(
                new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of()))),
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
        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of(existing));

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(
                new OfflineSyncCommandDto(commandId, "POST", "/api/product", null, Map.of()))),
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

        OfflineSyncCommandEntity rejected = new OfflineSyncCommandEntity();
        rejected.setCommandId(rejectedId);
        rejected.setStatus(OfflineSyncCommandStatus.REJECTED);
        rejected.setResponseStatus(400);

        OfflineSyncCommandEntity exhausted = new OfflineSyncCommandEntity();
        exhausted.setCommandId(exhaustedId);
        exhausted.setStatus(OfflineSyncCommandStatus.FAILED);
        exhausted.setRetryCount(new StarterOfflineProperties().getMaxReplayAttempts());

        when(repository().findAllByCommandIdIn(any())).thenReturn(List.of(done, rejected, exhausted));

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(
                new OfflineSyncCommandDto(doneId, "POST", "/api/product", null, Map.of()),
                new OfflineSyncCommandDto(rejectedId, "POST", "/api/product", null, Map.of()),
                new OfflineSyncCommandDto(exhaustedId, "POST", "/api/product", null, Map.of()))),
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
    void privateHelper_IsPermanentFailure_SeparatesClientErrorsFromTransientOnes() throws Exception {
        OfflineSyncService service = newService();

        assertTrue((Boolean) invoke(service, "isPermanentFailure",
                new Class<?>[] { org.springframework.http.HttpStatusCode.class },
                org.springframework.http.HttpStatus.BAD_REQUEST));
        assertFalse((Boolean) invoke(service, "isPermanentFailure",
                new Class<?>[] { org.springframework.http.HttpStatusCode.class },
                org.springframework.http.HttpStatus.REQUEST_TIMEOUT));
        assertFalse((Boolean) invoke(service, "isPermanentFailure",
                new Class<?>[] { org.springframework.http.HttpStatusCode.class },
                org.springframework.http.HttpStatus.TOO_MANY_REQUESTS));
        assertFalse((Boolean) invoke(service, "isPermanentFailure",
                new Class<?>[] { org.springframework.http.HttpStatusCode.class },
                org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR));
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
        when(handler.supports(command, HttpMethod.POST)).thenReturn(true);
        when(handler.process(eq(command)))
                .thenReturn(new OfflineSyncCommandResultDto(commandId, true, 201, null));

        OfflineSyncService service = new OfflineSyncService(heartbeatService, repository, new ObjectMapper(), actorResolver,
                List.of(handler), filterBuilder);

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(command)),
                requestWithBaseUrl());

        assertEquals(1, response.accepted());
        assertEquals(0, response.failed());
        assertEquals(201, response.results().get(0).status());
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
        when(handler.supports(command, HttpMethod.POST)).thenReturn(true);
        when(handler.process(eq(command))).thenThrow(new RuntimeException("boom"));

        OfflineSyncService service = new OfflineSyncService(heartbeatService, repository, new ObjectMapper(), actorResolver,
                List.of(handler), filterBuilder);

        OfflineSyncBatchResponseDto response = service.processBatch(new OfflineSyncBatchRequestDto(List.of(command)),
                requestWithBaseUrl());

        assertEquals(0, response.accepted());
        assertEquals(1, response.failed());
        assertEquals(500, response.results().get(0).status());
        assertEquals("Command replay failed.", response.results().get(0).error());
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
    void privateHelpers_CopyHeadersReplayableUrlAndToJsonFallback() throws Exception {
        OfflineHeartbeatService heartbeatService = org.mockito.Mockito.mock(OfflineHeartbeatService.class);
        OfflineSyncCommandRepository repository = org.mockito.Mockito.mock(OfflineSyncCommandRepository.class);
        OfflineActorResolver actorResolver = org.mockito.Mockito.mock(OfflineActorResolver.class);
        QueryEngineFilterSpecificationBuilder filterBuilder = org.mockito.Mockito
                .mock(QueryEngineFilterSpecificationBuilder.class);
        ObjectMapper mapper = org.mockito.Mockito.mock(ObjectMapper.class);

        when(mapper.writeValueAsString(any())).thenThrow(new JsonProcessingException("x") {
            private static final long serialVersionUID = 1L;
        });

        OfflineSyncService service = new OfflineSyncService(heartbeatService, repository, mapper, actorResolver,
                List.of(), filterBuilder);

        HttpHeaders headers = new HttpHeaders();
        MockHttpServletRequest request = requestWithBaseUrl();
        request.addHeader("Cookie", "SESSION=abc");
        request.addHeader("X-XSRF-TOKEN", "token");

        invoke(service, "copyHeaders", new Class<?>[] { HttpHeaders.class, Map.class, jakarta.servlet.http.HttpServletRequest.class },
                headers,
                Map.of("Idempotency-Key", "ok", "X-Custom", "blocked", "Host", "example.org", "Cookie",
                        "should-not-pass", "", "skip"),
                request);

        assertEquals("SESSION=abc", headers.getFirst("Cookie"));
        assertEquals("token", headers.getFirst("X-XSRF-TOKEN"));
        assertEquals("ok", headers.getFirst("Idempotency-Key"));
        assertNull(headers.getFirst("X-Custom"));
        assertNull(headers.getFirst("Host"));

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
    void privateHelper_NewCommandEntity_UsesActorWhenPresentOtherwiseSystem() throws Exception {
        OfflineSyncService service = newService();

        when(actorResolver().resolveCurrentActor())
                .thenReturn(Optional.of(new OfflineActor(UUID.fromString("11111111-1111-1111-1111-111111111111"), "demo", false)))
                .thenReturn(Optional.empty());

        UUID firstId = UUID.randomUUID();
        OfflineSyncCommandDto first = new OfflineSyncCommandDto(firstId, "post", "/api/p", null, Map.of("k", "v"));
        OfflineSyncCommandEntity firstEntity = (OfflineSyncCommandEntity) invoke(service, "newCommandEntity",
                new Class<?>[] { OfflineSyncCommandDto.class }, first);

        assertEquals(firstId, firstEntity.getCommandId());
        assertEquals("POST", firstEntity.getHttpMethod());
        assertEquals("demo", firstEntity.getOwnerUsername());
        assertNotNull(firstEntity.getOwnerId());

        OfflineSyncCommandDto second = new OfflineSyncCommandDto(UUID.randomUUID(), "get", "/api/p", null, Map.of());
        OfflineSyncCommandEntity secondEntity = (OfflineSyncCommandEntity) invoke(service, "newCommandEntity",
                new Class<?>[] { OfflineSyncCommandDto.class }, second);
        assertEquals("system", secondEntity.getOwnerUsername());
        assertNull(secondEntity.getOwnerId());
    }

    private final OfflineHeartbeatService heartbeatService = org.mockito.Mockito.mock(OfflineHeartbeatService.class);
    private final OfflineSyncCommandRepository repository = org.mockito.Mockito.mock(OfflineSyncCommandRepository.class);
    private final OfflineActorResolver actorResolver = org.mockito.Mockito.mock(OfflineActorResolver.class);
    private final QueryEngineFilterSpecificationBuilder queryBuilder = org.mockito.Mockito
            .mock(QueryEngineFilterSpecificationBuilder.class);

    private OfflineSyncService newService() {
                when(actorResolver.resolveCurrentActor()).thenReturn(Optional.empty());
        return new OfflineSyncService(heartbeatService, repository, new ObjectMapper(), actorResolver, List.of(), queryBuilder);
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
