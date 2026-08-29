package com.vireocode.vireo.offline;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.dao.DataIntegrityViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.util.StringUtils;

import com.vireocode.vireo.queryengine.QueryEngineFilterSpecificationBuilder;
import com.vireocode.vireo.queryengine.QueryFilterRequest;
import com.vireocode.vireo.web.RestUtils;
import com.vireocode.vireo.web.SearchablePageable;

import jakarta.servlet.http.HttpServletRequest;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

public class OfflineSyncService {

    private static final Logger log = LoggerFactory.getLogger(OfflineSyncService.class);
    private static final String ALREADY_PROCESSED_MESSAGE = "Command already processed.";
    private static final String REJECTED_MESSAGE = "Command was permanently rejected by the server.";
    private static final String CONCURRENT_REPLAY_MESSAGE = "Command is already being replayed by a concurrent batch.";
    private static final String BINDING_MISMATCH_MESSAGE =
            "Command identity is already bound to a different request.";
    private static final String LEGACY_BINDING_MESSAGE =
            "Command predates payload binding and cannot be replayed safely.";
    private static final String NO_REPLAY_HANDLER_MESSAGE =
            "No application offline replay handler accepted the command.";

    private final OfflineHeartbeatService offlineHeartbeatService;
    private final OfflineSyncCommandRepository offlineSyncCommandRepository;
    private final ObjectMapper objectMapper;
    private final OfflineActorResolver offlineActorResolver;
    private final List<OfflineSyncReplayHandler> replayHandlers;
    private final QueryEngineFilterSpecificationBuilder queryEngineFilterSpecificationBuilder;
    private final StarterOfflineProperties properties;
    private final Clock clock;
    private final OfflineSyncTransactionOperations transactionOperations;
    private final OfflineDataLifecyclePolicy lifecyclePolicy;
    private final OfflineDataLifecycleService lifecycleService;

    public OfflineSyncService(OfflineHeartbeatService offlineHeartbeatService,
            OfflineSyncCommandRepository offlineSyncCommandRepository,
            ObjectMapper objectMapper,
            OfflineActorResolver offlineActorResolver,
            List<OfflineSyncReplayHandler> replayHandlers,
            QueryEngineFilterSpecificationBuilder queryEngineFilterSpecificationBuilder,
            PlatformTransactionManager transactionManager) {
        this(offlineHeartbeatService, offlineSyncCommandRepository, objectMapper, offlineActorResolver, replayHandlers,
                queryEngineFilterSpecificationBuilder, new StarterOfflineProperties(), Clock.systemUTC(),
                new OfflineSyncTransactionOperations(transactionManager), null, null);
    }

    OfflineSyncService(OfflineHeartbeatService offlineHeartbeatService,
            OfflineSyncCommandRepository offlineSyncCommandRepository,
            ObjectMapper objectMapper,
            OfflineActorResolver offlineActorResolver,
            List<OfflineSyncReplayHandler> replayHandlers,
            QueryEngineFilterSpecificationBuilder queryEngineFilterSpecificationBuilder,
            StarterOfflineProperties properties,
            Clock clock,
            OfflineSyncTransactionOperations transactionOperations) {
        this(offlineHeartbeatService, offlineSyncCommandRepository, objectMapper, offlineActorResolver, replayHandlers,
                queryEngineFilterSpecificationBuilder, properties, clock, transactionOperations, null, null);
    }

    OfflineSyncService(OfflineHeartbeatService offlineHeartbeatService,
            OfflineSyncCommandRepository offlineSyncCommandRepository,
            ObjectMapper objectMapper,
            OfflineActorResolver offlineActorResolver,
            List<OfflineSyncReplayHandler> replayHandlers,
            QueryEngineFilterSpecificationBuilder queryEngineFilterSpecificationBuilder,
            StarterOfflineProperties properties,
            Clock clock,
            OfflineSyncTransactionOperations transactionOperations,
            OfflineDataLifecyclePolicy lifecyclePolicy,
            OfflineDataLifecycleService lifecycleService) {
        this.offlineHeartbeatService = offlineHeartbeatService;
        this.offlineSyncCommandRepository = offlineSyncCommandRepository;
        this.objectMapper = objectMapper;
        this.offlineActorResolver = offlineActorResolver;
        this.replayHandlers = replayHandlers == null ? List.of() : List.copyOf(replayHandlers);
        this.queryEngineFilterSpecificationBuilder = queryEngineFilterSpecificationBuilder;
        this.properties = java.util.Objects.requireNonNull(properties, "properties");
        this.clock = java.util.Objects.requireNonNull(clock, "clock");
        this.transactionOperations = java.util.Objects.requireNonNull(transactionOperations, "transactionOperations");
        this.lifecyclePolicy = lifecyclePolicy == null
                ? new SafeDefaultOfflineDataLifecyclePolicy(properties)
                : lifecyclePolicy;
        this.lifecycleService = lifecycleService == null
                ? new OfflineDataLifecycleService(offlineSyncCommandRepository, properties, clock, event -> {
                })
                : lifecycleService;
    }

    public OfflineSyncBatchResponseDto processBatch(OfflineSyncBatchRequestDto request,
            HttpServletRequest sourceRequest) {
        java.util.Objects.requireNonNull(request, "request");
        java.util.Objects.requireNonNull(sourceRequest, "sourceRequest");
        if (request.commands().isEmpty()) {
            return new OfflineSyncBatchResponseDto(0, 0, List.of());
        }
        if (request.commands().size() > properties.getMaxBatchSize()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "At most " + properties.getMaxBatchSize() + " offline commands may be replayed per batch.");
        }
        long uniqueCommandIds = request.commands().stream().map(OfflineSyncCommandDto::commandId).distinct().count();
        if (uniqueCommandIds != request.commands().size()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Offline command IDs must be unique within a batch.");
        }

        OfflineActor actor = offlineActorResolver.resolveCurrentActor()
                .orElseThrow(() -> RestUtils.unauthorized("Unauthorized"));
        String ownerKey = ownerKey(actor);

        offlineHeartbeatService.beginSync();
        try {
            return processBatchInternal(request, actor, ownerKey);
        } finally {
            offlineHeartbeatService.endSync();
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
        if (currentUser.privileged()) {
            return (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        }

        return (root, query, criteriaBuilder) -> {
            if (currentUser.id() == null) {
                return criteriaBuilder.equal(root.get("ownerUsername"), currentUser.username());
            }
            return criteriaBuilder.or(
                    criteriaBuilder.equal(root.get("ownerId"), currentUser.id()),
                    criteriaBuilder.and(
                            criteriaBuilder.isNull(root.get("ownerId")),
                            criteriaBuilder.equal(root.get("ownerUsername"), currentUser.username())));
        };
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
            OfflineActor actor, String ownerKey) {
        List<OfflineSyncCommandResultDto> results = new ArrayList<>(request.commands().size());
        for (OfflineSyncCommandDto command : request.commands()) {
            try {
                results.add(processCommand(command, actor, ownerKey));
            } catch (RuntimeException ex) {
                log.warn("Offline command {} persistence transition failed.", command.commandId(), ex);
                results.add(failed(command, 500, "Command persistence failed."));
            }
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
    private CommandClaim processExistingCommand(OfflineSyncCommandDto command,
            OfflineSyncCommandEntity existing) {
        if (!StringUtils.hasText(existing.getRequestFingerprint())) {
            return CommandClaim.complete(bindingRejected(command, LEGACY_BINDING_MESSAGE));
        }
        if (!MessageDigest.isEqual(
                existing.getRequestFingerprint().getBytes(StandardCharsets.US_ASCII),
                requestFingerprint(command).getBytes(StandardCharsets.US_ASCII))) {
            return CommandClaim.complete(bindingRejected(command, BINDING_MISMATCH_MESSAGE));
        }

        if (OfflineSyncCommandStatus.DONE == existing.getStatus()) {
            return CommandClaim.complete(new OfflineSyncCommandResultDto(command.commandId(), true,
                    existing.getResponseStatus() == null ? 200 : existing.getResponseStatus(),
                    ALREADY_PROCESSED_MESSAGE,
                    OfflineSyncResultReason.ALREADY_APPLIED));
        }

        if (OfflineSyncCommandStatus.REJECTED == existing.getStatus()) {
            return CommandClaim.complete(new OfflineSyncCommandResultDto(command.commandId(), false,
                    existing.getResponseStatus() == null ? 422 : existing.getResponseStatus(),
                    StringUtils.hasText(existing.getErrorMessage()) ? existing.getErrorMessage() : REJECTED_MESSAGE,
                    OfflineSyncResultReason.REJECTED));
        }

        if (existing.getRetryCount() >= properties.getMaxReplayAttempts()) {
            return CommandClaim.complete(rejectExhaustedCommand(command, existing));
        }

        existing.setRetryCount(existing.getRetryCount() + 1);
        existing.setStatus(OfflineSyncCommandStatus.PENDING);
        existing.setErrorMessage(null);
        offlineSyncCommandRepository.save(existing);
        return CommandClaim.replay(existing);
    }

    private OfflineSyncCommandResultDto rejectExhaustedCommand(OfflineSyncCommandDto command,
            OfflineSyncCommandEntity existing) {
        String message = "Command replay abandoned after " + properties.getMaxReplayAttempts() + " failed attempts.";
        existing.setStatus(OfflineSyncCommandStatus.REJECTED);
        existing.setErrorMessage(message);
        existing.setProcessedAt(Instant.now(clock));
        offlineSyncCommandRepository.save(existing);
        return new OfflineSyncCommandResultDto(command.commandId(), false,
                existing.getResponseStatus() == null ? 500 : existing.getResponseStatus(),
                message,
                OfflineSyncResultReason.RETRY_LIMIT_EXCEEDED);
    }

    private OfflineSyncCommandResultDto bindingRejected(OfflineSyncCommandDto command, String message) {
        return new OfflineSyncCommandResultDto(command.commandId(), false, 409, message,
                OfflineSyncResultReason.REJECTED);
    }

    private OfflineSyncCommandResultDto processCommand(OfflineSyncCommandDto command, OfflineActor actor,
            String ownerKey) {
        CommandClaim claim;
        try {
            claim = transactionOperations.requiresNew(() -> claimCommand(command, actor, ownerKey));
        } catch (DataIntegrityViolationException ex) {
            return new OfflineSyncCommandResultDto(command.commandId(), false, 409, CONCURRENT_REPLAY_MESSAGE,
                    OfflineSyncResultReason.RETRYABLE);
        }

        if (claim.completedResult() != null) {
            return claim.completedResult();
        }

        OfflineSyncCommandResultDto result = dispatchCommand(sanitizeCommand(command));
        transactionOperations.requiresNew(() -> {
            persistHandlerResult(claim.entity(), result);
            return Boolean.TRUE;
        });
        return result;
    }

    private CommandClaim claimCommand(OfflineSyncCommandDto command, OfflineActor actor, String ownerKey) {
        List<OfflineSyncCommandEntity> stored = offlineSyncCommandRepository
                .findAllByCommandIdIn(List.of(command.commandId()));
        Optional<OfflineSyncCommandEntity> storedCommand = stored.stream()
                .filter(candidate -> command.commandId().equals(candidate.getCommandId()))
                .findFirst();
        if (storedCommand.isPresent()) {
            OfflineSyncCommandEntity existing = storedCommand.get();
            if (!ownerKey.equals(existing.getOwnerKey())) {
                return CommandClaim.complete(new OfflineSyncCommandResultDto(command.commandId(), false, 409,
                        CONCURRENT_REPLAY_MESSAGE, OfflineSyncResultReason.RETRYABLE));
            }
            return processExistingCommand(command, existing);
        }

        OfflineSyncCommandEntity entity = newCommandEntity(command, actor, ownerKey);
        entity.setStatus(OfflineSyncCommandStatus.PENDING);
        lifecycleService.admit(entity);
        offlineSyncCommandRepository.saveAndFlush(entity);
        lifecycleService.redacted();
        return CommandClaim.replay(entity);
    }

    private OfflineSyncCommandResultDto dispatchCommand(OfflineSyncCommandDto command) {
        if (!isReplayableApiUrl(command.url())) {
            return rejected(command, 400, "The command URL is outside the configured replay policy.");
        }

        HttpMethod method;
        try {
            method = HttpMethod.valueOf(command.method().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return rejected(command, 400, "Unsupported HTTP method.");
        }
        if (!properties.getReplayMethods().stream().anyMatch(allowed -> allowed.equalsIgnoreCase(method.name()))) {
            return rejected(command, 400, "The HTTP method is not enabled for offline replay.");
        }

        try {
            OfflineSyncReplayHandler replayHandler = findReplayHandler(command, method);
            if (replayHandler == null) {
                return rejected(command, 422, NO_REPLAY_HANDLER_MESSAGE);
            }
            OfflineSyncCommandResultDto result = java.util.Objects.requireNonNull(replayHandler.process(command),
                    "Offline replay handlers must return a result");
            if (!command.commandId().equals(result.commandId())) {
                throw new IllegalStateException("Offline replay handler returned a different command ID.");
            }
            validateHandlerResult(result);
            return result;
        } catch (Exception ex) {
            log.warn("Offline command {} replay failed.", command.commandId(), ex);
            return failed(command, 500, "Command replay failed.");
        }
    }

    private void validateHandlerResult(OfflineSyncCommandResultDto result) {
        if (result.reason() == null || result.status() < 100 || result.status() > 599) {
            throw new IllegalStateException("Offline replay handler returned an invalid outcome.");
        }
        boolean appliedReason = result.reason() == OfflineSyncResultReason.APPLIED
                || result.reason() == OfflineSyncResultReason.ALREADY_APPLIED;
        if (result.success() != appliedReason) {
            throw new IllegalStateException("Offline replay handler returned an inconsistent outcome.");
        }
    }

    private void persistHandlerResult(OfflineSyncCommandEntity entity, OfflineSyncCommandResultDto result) {
        entity.setStatus(result.success()
                ? OfflineSyncCommandStatus.DONE
                : switch (result.reason()) {
                    case REJECTED, RETRY_LIMIT_EXCEEDED -> OfflineSyncCommandStatus.REJECTED;
                    case APPLIED, ALREADY_APPLIED, RETRYABLE -> OfflineSyncCommandStatus.FAILED;
                });
        entity.setResponseStatus(result.status());
        entity.setErrorMessage(result.success() ? null : result.error());
        entity.setProcessedAt(Instant.now(clock));
        offlineSyncCommandRepository.save(entity);
    }

    private OfflineSyncCommandResultDto rejected(OfflineSyncCommandDto command, int status, String errorMessage) {
        return new OfflineSyncCommandResultDto(command.commandId(), false, status, errorMessage,
                OfflineSyncResultReason.REJECTED);
    }

    private OfflineSyncCommandResultDto failed(OfflineSyncCommandDto command, int status, String errorMessage) {
        return new OfflineSyncCommandResultDto(command.commandId(), false, status, errorMessage,
                OfflineSyncResultReason.RETRYABLE);
    }

    private OfflineSyncReplayHandler findReplayHandler(OfflineSyncCommandDto command, HttpMethod method) {
        return replayHandlers.stream()
                .filter(handler -> handler.supports(command, method))
                .findFirst()
                .orElse(null);
    }

    private OfflineSyncCommandEntity newCommandEntity(OfflineSyncCommandDto command, OfflineActor actor,
            String ownerKey) {
        OfflineSyncCommandEntity entity = new OfflineSyncCommandEntity();
        entity.setCommandId(command.commandId());
        entity.setHttpMethod(command.method().toUpperCase(Locale.ROOT));
        entity.setUrl(command.url());
        entity.setRequestFingerprint(requestFingerprint(command));
        Instant createdAt = Instant.now(clock);
        entity.setCreatedAt(createdAt);
        entity.setOwnerUsername(StringUtils.hasText(actor.username()) ? actor.username().trim() : actor.id().toString());
        entity.setOwnerId(actor.id());
        entity.setOwnerKey(ownerKey);
        OfflineDataLifecycleDecision lifecycle = java.util.Objects.requireNonNull(
                lifecyclePolicy.classify(new OfflineDataLifecycleContext(
                        createdAt, actor, ownerKey, sanitizeCommand(command),
                        toJson(command.body()), toJson(sanitizeReplayHeaders(command.headers())))),
                "OfflineDataLifecyclePolicy must return a decision");
        if (lifecycle.retainUntil().isBefore(createdAt)) {
            throw new OfflineDataLifecycleException("Offline retainUntil must not precede createdAt.");
        }
        entity.setLifecyclePartition(lifecycle.partitionKey());
        entity.setRetainUntil(lifecycle.retainUntil());
        entity.setLegalHold(lifecycle.legalHold());
        entity.setRequestBody(lifecycle.requestBody());
        entity.setRequestHeaders(lifecycle.requestHeaders());
        entity.setPayloadRedactedAt(
                lifecycle.requestBody() == null && lifecycle.requestHeaders() == null ? createdAt : null);
        return entity;
    }

    private String ownerKey(OfflineActor actor) {
        if (actor.id() != null) {
            return "id:" + actor.id();
        }
        if (!StringUtils.hasText(actor.username())) {
            throw RestUtils.unauthorized("Unauthorized");
        }
        return "username:" + actor.username().trim().toLowerCase(Locale.ROOT);
    }

    private String requestFingerprint(OfflineSyncCommandDto command) {
        ObjectNode canonical = objectMapper.createObjectNode();
        canonical.put("method", command.method().toUpperCase(Locale.ROOT));
        canonical.put("url", command.url());
        canonical.set("body", canonicalize(OfflineSyncBodyNormalizer.normalize(command.body(), objectMapper)));

        ObjectNode headers = objectMapper.createObjectNode();
        Map<String, String> normalizedHeaders = new TreeMap<>();
        sanitizeReplayHeaders(command.headers()).forEach((name, value) -> {
            String normalizedName = name.toLowerCase(Locale.ROOT);
            String previous = normalizedHeaders.putIfAbsent(normalizedName, value);
            if (previous != null && !previous.equals(value)) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Replay headers must not repeat a name with different casing.");
            }
        });
        normalizedHeaders.forEach(headers::put);
        canonical.set("headers", headers);

        try {
            byte[] bytes = objectMapper.writeValueAsBytes(canonical);
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (JacksonException | NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Unable to fingerprint an offline command.", ex);
        }
    }

    private JsonNode canonicalize(JsonNode value) {
        if (value == null || value.isNull() || value.isValueNode()) {
            return value == null ? objectMapper.nullNode() : value;
        }
        if (value.isArray()) {
            ArrayNode result = objectMapper.createArrayNode();
            value.forEach(child -> result.add(canonicalize(child)));
            return result;
        }

        ObjectNode result = objectMapper.createObjectNode();
        value.propertyNames().stream()
                .sorted()
                .forEach(field -> result.set(field, canonicalize(value.get(field))));
        return result;
    }

    private String toJson(Object value) {
        if (value == null) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(value);
        } catch (JacksonException ex) {
            return Optional.ofNullable(value).map(Object::toString).orElse(null);
        }
    }

    private boolean isReplayableApiUrl(String url) {
        if (!StringUtils.hasText(url)) {
            return false;
        }
        try {
            URI parsed = URI.create(url);
            String lowerRawPath = parsed.getRawPath() == null ? "" : parsed.getRawPath().toLowerCase(Locale.ROOT);
            if (parsed.isAbsolute() || parsed.getRawAuthority() != null || parsed.getRawFragment() != null
                    || parsed.getRawPath() == null || !parsed.getRawPath().equals(parsed.normalize().getRawPath())
                    || lowerRawPath.contains("%2e") || lowerRawPath.contains("%2f") || lowerRawPath.contains("%5c")
                    || lowerRawPath.contains("\\")) {
                return false;
            }
            String path = parsed.getPath();
            return path.startsWith(properties.getReplayApiPrefix())
                    && properties.getExcludedReplayPathPrefixes().stream().noneMatch(path::startsWith)
                    && !isOfflineEndpointPath(path);
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    private boolean isOfflineEndpointPath(String path) {
        return java.util.stream.Stream.of(properties.getSyncEndpointPath(), properties.getHeartbeatEndpointPath(),
                properties.getHydrationEndpointPath())
                .anyMatch(endpoint -> path.equals(endpoint) || path.startsWith(endpoint + "/"));
    }

    private Map<String, String> sanitizeReplayHeaders(Map<String, String> commandHeaders) {
        if (commandHeaders == null || commandHeaders.isEmpty()) {
            return Map.of();
        }
        Map<String, String> sanitized = new java.util.LinkedHashMap<>();
        commandHeaders.forEach((name, value) -> {
            if (StringUtils.hasText(name) && StringUtils.hasText(value)
                    && properties.getReplayHeaders().stream().anyMatch(allowed -> allowed.equalsIgnoreCase(name))) {
                sanitized.put(name, value);
            }
        });
        return Map.copyOf(sanitized);
    }

    private OfflineSyncCommandDto sanitizeCommand(OfflineSyncCommandDto command) {
        return new OfflineSyncCommandDto(command.commandId(), command.method(), command.url(), command.body(),
                sanitizeReplayHeaders(command.headers()));
    }

    private record CommandClaim(OfflineSyncCommandEntity entity, OfflineSyncCommandResultDto completedResult) {

        private static CommandClaim replay(OfflineSyncCommandEntity entity) {
            return new CommandClaim(java.util.Objects.requireNonNull(entity, "entity"), null);
        }

        private static CommandClaim complete(OfflineSyncCommandResultDto result) {
            return new CommandClaim(null, java.util.Objects.requireNonNull(result, "result"));
        }
    }
}
