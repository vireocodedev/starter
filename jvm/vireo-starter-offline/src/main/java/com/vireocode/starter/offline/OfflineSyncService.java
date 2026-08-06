package com.vireocode.starter.offline;

import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vireocode.starter.queryengine.QueryEngineFilterSpecificationBuilder;
import com.vireocode.starter.queryengine.QueryFilterRequest;
import com.vireocode.starter.web.RestUtils;
import com.vireocode.starter.web.SearchablePageable;

import jakarta.servlet.http.HttpServletRequest;

public class OfflineSyncService {

    private static final String API_PREFIX = "/api/";
    private static final String OFFLINE_PREFIX = "/api/offline/";
    private static final String HEADER_COOKIE = "Cookie";
    private static final String HEADER_XSRF = "X-XSRF-TOKEN";
    private static final String ALREADY_PROCESSED_MESSAGE = "Command already processed.";
    private static final String REJECTED_MESSAGE = "Command was permanently rejected by the server.";
    private static final String CONCURRENT_REPLAY_MESSAGE = "Command is already being replayed by a concurrent batch.";

    /** Maximum number of server-side replay attempts before a command is rejected. */
    static final int MAX_REPLAY_ATTEMPTS = 5;

    private final RestClient restClient;
    private final OfflineHeartbeatService offlineHeartbeatService;
    private final OfflineSyncCommandRepository offlineSyncCommandRepository;
    private final ObjectMapper objectMapper;
    private final OfflineActorResolver offlineActorResolver;
    private final List<OfflineSyncReplayHandler> replayHandlers;
    private final QueryEngineFilterSpecificationBuilder queryEngineFilterSpecificationBuilder;

    public OfflineSyncService(OfflineHeartbeatService offlineHeartbeatService,
            OfflineSyncCommandRepository offlineSyncCommandRepository,
            ObjectMapper objectMapper,
            OfflineActorResolver offlineActorResolver,
            List<OfflineSyncReplayHandler> replayHandlers,
            QueryEngineFilterSpecificationBuilder queryEngineFilterSpecificationBuilder) {
        this.restClient = RestClient.builder().build();
        this.offlineHeartbeatService = offlineHeartbeatService;
        this.offlineSyncCommandRepository = offlineSyncCommandRepository;
        this.objectMapper = objectMapper;
        this.offlineActorResolver = offlineActorResolver;
        this.replayHandlers = replayHandlers;
        this.queryEngineFilterSpecificationBuilder = queryEngineFilterSpecificationBuilder;
    }

    @Transactional
    public OfflineSyncBatchResponseDto processBatch(OfflineSyncBatchRequestDto request,
            HttpServletRequest sourceRequest) {
        if (request.commands().isEmpty()) {
            return new OfflineSyncBatchResponseDto(0, 0, List.of());
        }

        offlineHeartbeatService.markSyncInProgress(true);
        try {
            return processBatchInternal(request, sourceRequest);
        } finally {
            offlineHeartbeatService.markSyncInProgress(false);
        }
    }

    public Page<OfflineSyncCommandListItemDto> searchCommands(SearchablePageable pageable, QueryFilterRequest filters) {
        OfflineActor currentUser = offlineActorResolver.resolveCurrentActor()
                .orElseThrow(() -> RestUtils.unauthorized("Unauthorized"));

        Specification<OfflineSyncCommandEntity> specification = scopeByCurrentUser(currentUser);
        if (pageable.hasSearchText()) {
            specification = specification.and(searchSpecification(pageable.getSearchText()));
        }

        if (filters != null) {
            specification = specification.and(
                    queryEngineFilterSpecificationBuilder.build(OfflineSyncCommandEntity.class, filters));
        }

        return offlineSyncCommandRepository.findAll(specification, pageable.getPageable())
                .map(this::toListItem);
    }

    private Specification<OfflineSyncCommandEntity> scopeByCurrentUser(OfflineActor currentUser) {
        if (currentUser.superadmin()) {
            return (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        }

        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("ownerUsername"),
                currentUser.username());
    }

    private Specification<OfflineSyncCommandEntity> searchSpecification(String rawSearchText) {
        List<String> chunks = List.of(rawSearchText.split("\\s+"))
                .stream()
                .map(String::trim)
                .filter(chunk -> !chunk.isBlank())
                .toList();

        if (chunks.isEmpty()) {
            return (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        }

        return (root, query, criteriaBuilder) -> {
            List<jakarta.persistence.criteria.Predicate> chunkPredicates = chunks.stream()
                    .map(chunk -> "%" + chunk.toLowerCase(Locale.ROOT) + "%")
                    .map(pattern -> criteriaBuilder.or(
                            criteriaBuilder.like(criteriaBuilder.lower(root.get("url")), pattern),
                            criteriaBuilder.like(criteriaBuilder.lower(root.get("httpMethod")), pattern),
                            criteriaBuilder.like(criteriaBuilder.lower(root.get("ownerUsername")), pattern),
                            criteriaBuilder.like(
                                    criteriaBuilder.lower(criteriaBuilder.coalesce(root.get("errorMessage"), "")),
                                    pattern),
                            criteriaBuilder.like(criteriaBuilder.lower(root.get("status").as(String.class)), pattern)))
                    .toList();

            return criteriaBuilder.and(chunkPredicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private OfflineSyncCommandListItemDto toListItem(OfflineSyncCommandEntity row) {
        return new OfflineSyncCommandListItemDto(
                row.getCommandId(),
                row.getHttpMethod(),
                row.getUrl(),
                row.getRequestBody(),
                row.getStatus(),
                row.getResponseStatus(),
                row.getErrorMessage(),
                row.getCreatedAt(),
                row.getProcessedAt());
    }

    private OfflineSyncBatchResponseDto processBatchInternal(OfflineSyncBatchRequestDto request,
            HttpServletRequest sourceRequest) {
        List<OfflineSyncCommandResultDto> results = new ArrayList<>(request.commands().size());
        Map<UUID, OfflineSyncCommandEntity> existingByCommandId = loadExistingCommands(request.commands());
        String baseUrl = UriComponentsBuilder.fromUriString(sourceRequest.getRequestURL().toString())
                .replacePath(null)
                .replaceQuery(null)
                .build()
                .toUriString();

        for (OfflineSyncCommandDto command : request.commands()) {
            OfflineSyncCommandEntity existing = existingByCommandId.get(command.commandId());
            if (existing != null) {
                results.add(processExistingCommand(command, existing, sourceRequest, baseUrl));
                continue;
            }

            results.add(processCommand(command, sourceRequest, baseUrl));
        }

        int accepted = (int) results.stream().filter(OfflineSyncCommandResultDto::success).count();
        int failed = results.size() - accepted;
        return new OfflineSyncBatchResponseDto(accepted, failed, List.copyOf(results));
    }

    /**
     * Resolves a command whose {@code commandId} is already stored. Only a
     * {@link OfflineSyncCommandStatus#DONE} row is idempotent success; failed rows
     * are replayed again (bounded) and rejected rows stay permanently failed.
     */
    private OfflineSyncCommandResultDto processExistingCommand(OfflineSyncCommandDto command,
            OfflineSyncCommandEntity existing, HttpServletRequest sourceRequest, String baseUrl) {
        if (OfflineSyncCommandStatus.DONE == existing.getStatus()) {
            return new OfflineSyncCommandResultDto(command.commandId(), true,
                    existing.getResponseStatus() == null ? 200 : existing.getResponseStatus(),
                    ALREADY_PROCESSED_MESSAGE,
                    OfflineSyncResultReason.ALREADY_APPLIED);
        }

        if (OfflineSyncCommandStatus.REJECTED == existing.getStatus()) {
            return new OfflineSyncCommandResultDto(command.commandId(), false,
                    existing.getResponseStatus() == null ? 422 : existing.getResponseStatus(),
                    StringUtils.hasText(existing.getErrorMessage()) ? existing.getErrorMessage() : REJECTED_MESSAGE,
                    OfflineSyncResultReason.REJECTED);
        }

        if (existing.getRetryCount() >= MAX_REPLAY_ATTEMPTS) {
            return rejectExhaustedCommand(command, existing);
        }

        existing.setRetryCount(existing.getRetryCount() + 1);
        existing.setStatus(OfflineSyncCommandStatus.PENDING);
        existing.setErrorMessage(null);
        offlineSyncCommandRepository.save(existing);
        return replayCommand(command, existing, sourceRequest, baseUrl);
    }

    private OfflineSyncCommandResultDto rejectExhaustedCommand(OfflineSyncCommandDto command,
            OfflineSyncCommandEntity existing) {
        String message = "Command replay abandoned after " + MAX_REPLAY_ATTEMPTS + " failed attempts.";
        existing.setStatus(OfflineSyncCommandStatus.REJECTED);
        existing.setErrorMessage(message);
        existing.setProcessedAt(Instant.now());
        offlineSyncCommandRepository.save(existing);
        return new OfflineSyncCommandResultDto(command.commandId(), false,
                existing.getResponseStatus() == null ? 500 : existing.getResponseStatus(),
                message,
                OfflineSyncResultReason.RETRY_LIMIT_EXCEEDED);
    }

    private OfflineSyncCommandResultDto processCommand(OfflineSyncCommandDto command, HttpServletRequest sourceRequest,
            String baseUrl) {
        OfflineSyncCommandEntity entity = newCommandEntity(command);
        entity.setStatus(OfflineSyncCommandStatus.PENDING);

        try {
            offlineSyncCommandRepository.saveAndFlush(entity);
        } catch (DataIntegrityViolationException ex) {
            // Another batch inserted the same command_id concurrently; the unique
            // constraint is the backstop. Keep the command on the client so the next
            // flush observes the persisted row and takes the DONE/FAILED/REJECTED path.
            return new OfflineSyncCommandResultDto(command.commandId(), false, 409, CONCURRENT_REPLAY_MESSAGE,
                    OfflineSyncResultReason.RETRYABLE);
        }

        return replayCommand(command, entity, sourceRequest, baseUrl);
    }

    private OfflineSyncCommandResultDto replayCommand(OfflineSyncCommandDto command, OfflineSyncCommandEntity entity,
            HttpServletRequest sourceRequest, String baseUrl) {
        if (!isReplayableApiUrl(command.url())) {
            return markRejected(command, entity, 400, "Only non-offline /api/** urls can be replayed.");
        }

        HttpMethod method;
        try {
            method = HttpMethod.valueOf(command.method().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return markRejected(command, entity, 400, "Unsupported HTTP method.");
        }

        try {
            OfflineSyncReplayHandler replayHandler = findReplayHandler(command, method);
            if (replayHandler != null) {
                return replayHandler.process(command, entity);
            }

            URI uri = URI.create(baseUrl + command.url());
            HttpStatusCode statusCode;
            if (HttpMethod.POST.equals(method)
                    || HttpMethod.PUT.equals(method)
                    || HttpMethod.PATCH.equals(method)
                    || HttpMethod.DELETE.equals(method)) {
                statusCode = restClient
                        .method(method)
                        .uri(uri)
                        .headers(headers -> copyHeaders(headers, command.headers(), sourceRequest))
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(command.body())
                        .retrieve()
                        .toBodilessEntity()
                        .getStatusCode();
            } else {
                statusCode = restClient
                        .method(method)
                        .uri(uri)
                        .headers(headers -> copyHeaders(headers, command.headers(), sourceRequest))
                        .retrieve()
                        .toBodilessEntity()
                        .getStatusCode();
            }

            boolean success = statusCode.is2xxSuccessful();
            entity.setStatus(success ? OfflineSyncCommandStatus.DONE : OfflineSyncCommandStatus.FAILED);
            entity.setResponseStatus(statusCode.value());
            entity.setErrorMessage(success ? null : "Command replay failed with non-success status.");
            entity.setProcessedAt(Instant.now());
            offlineSyncCommandRepository.save(entity);
            return new OfflineSyncCommandResultDto(
                    command.commandId(),
                    success,
                    statusCode.value(),
                    success ? null : "Command replay failed with non-success status.",
                    success ? OfflineSyncResultReason.APPLIED : OfflineSyncResultReason.RETRYABLE);
        } catch (RestClientResponseException ex) {
            if (isPermanentFailure(ex.getStatusCode())) {
                return markRejected(command, entity, ex.getStatusCode().value(), ex.getMessage());
            }

            return markFailed(command, entity, ex.getStatusCode().value(), ex.getMessage());
        } catch (Exception ex) {
            return markFailed(command, entity, 500, ex.getMessage());
        }
    }

    private OfflineSyncCommandResultDto markRejected(OfflineSyncCommandDto command, OfflineSyncCommandEntity entity,
            int status, String errorMessage) {
        entity.setStatus(OfflineSyncCommandStatus.REJECTED);
        entity.setResponseStatus(status);
        entity.setErrorMessage(errorMessage);
        entity.setProcessedAt(Instant.now());
        offlineSyncCommandRepository.save(entity);
        return new OfflineSyncCommandResultDto(command.commandId(), false, status, errorMessage,
                OfflineSyncResultReason.REJECTED);
    }

    private OfflineSyncCommandResultDto markFailed(OfflineSyncCommandDto command, OfflineSyncCommandEntity entity,
            int status, String errorMessage) {
        entity.setStatus(OfflineSyncCommandStatus.FAILED);
        entity.setResponseStatus(status);
        entity.setErrorMessage(errorMessage);
        entity.setProcessedAt(Instant.now());
        offlineSyncCommandRepository.save(entity);
        return new OfflineSyncCommandResultDto(command.commandId(), false, status, errorMessage,
                OfflineSyncResultReason.RETRYABLE);
    }

    /**
     * A 4xx replay response means the request itself is invalid, so replaying it
     * again can never succeed. Timeout and throttling responses stay retryable.
     */
    private boolean isPermanentFailure(HttpStatusCode statusCode) {
        if (!statusCode.is4xxClientError()) {
            return false;
        }

        int value = statusCode.value();
        return value != 408 && value != 429;
    }

    private OfflineSyncReplayHandler findReplayHandler(OfflineSyncCommandDto command, HttpMethod method) {
        return replayHandlers.stream()
                .filter(handler -> handler.supports(command, method))
                .findFirst()
                .orElse(null);
    }

    private OfflineSyncCommandEntity newCommandEntity(OfflineSyncCommandDto command) {
        OfflineSyncCommandEntity entity = new OfflineSyncCommandEntity();
        entity.setCommandId(command.commandId());
        entity.setHttpMethod(command.method().toUpperCase(Locale.ROOT));
        entity.setUrl(command.url());
        entity.setRequestBody(toJson(command.body()));
        entity.setRequestHeaders(toJson(command.headers()));
        entity.setCreatedAt(Instant.now());
        Optional<OfflineActor> currentActor = offlineActorResolver.resolveCurrentActor();
        entity.setOwnerUsername(currentActor.map(OfflineActor::username).orElse("system"));
        entity.setOwnerId(currentActor.map(OfflineActor::id).orElse(null));
        return entity;
    }

    private Map<UUID, OfflineSyncCommandEntity> loadExistingCommands(List<OfflineSyncCommandDto> commands) {
        if (CollectionUtils.isEmpty(commands)) {
            return Map.of();
        }

        Set<UUID> commandIds = commands.stream()
                .map(OfflineSyncCommandDto::commandId)
                .collect(Collectors.toSet());

        if (commandIds.isEmpty()) {
            return Map.of();
        }

        return offlineSyncCommandRepository.findAllByCommandIdIn(commandIds).stream()
                .collect(Collectors.toMap(OfflineSyncCommandEntity::getCommandId, entry -> entry, (a, b) -> a,
                        HashMap::new));
    }

    private String toJson(Object value) {
        if (value == null) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            return Optional.ofNullable(value).map(Object::toString).orElse(null);
        }
    }

    private boolean isReplayableApiUrl(String url) {
        return StringUtils.hasText(url)
                && url.startsWith(API_PREFIX)
                && !url.startsWith(OFFLINE_PREFIX);
    }

    private void copyHeaders(HttpHeaders target, Map<String, String> commandHeaders, HttpServletRequest sourceRequest) {
        String cookie = sourceRequest.getHeader(HEADER_COOKIE);
        if (StringUtils.hasText(cookie)) {
            target.set(HEADER_COOKIE, cookie);
        }

        String xsrfToken = sourceRequest.getHeader(HEADER_XSRF);
        if (StringUtils.hasText(xsrfToken)) {
            target.set(HEADER_XSRF, xsrfToken);
        }

        if (commandHeaders == null || commandHeaders.isEmpty()) {
            return;
        }

        commandHeaders.forEach((name, value) -> {
            if (!StringUtils.hasText(name) || !StringUtils.hasText(value)) {
                return;
            }
            String lowerName = name.toLowerCase(Locale.ROOT);
            if (HttpHeaders.CONTENT_LENGTH.equalsIgnoreCase(name)
                    || HttpHeaders.HOST.equalsIgnoreCase(name)
                    || HEADER_COOKIE.toLowerCase(Locale.ROOT).equals(lowerName)
                    || HEADER_XSRF.toLowerCase(Locale.ROOT).equals(lowerName)) {
                return;
            }
            target.set(name, value);
        });
    }
}
