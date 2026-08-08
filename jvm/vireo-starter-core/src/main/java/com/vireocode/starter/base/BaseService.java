package com.vireocode.starter.base;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ResolvableType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;

import com.vireocode.starter.web.SearchablePageable;
import com.vireocode.starter.web.RestUtils;
import com.vireocode.starter.spi.FilterSpecificationBuilder;
import com.vireocode.starter.spi.OfflineChangeBroadcaster;
import com.vireocode.starter.spi.OfflineRevisionTracker;
import com.vireocode.starter.spi.QueryFilterCriteria;

import jakarta.persistence.Id;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class BaseService<ID, DOMAIN extends BaseEntity, DTO> {
    protected final SearchableRepository<DOMAIN, ID> repository;
    protected final BaseMapper<DOMAIN, DTO> mapper;
    protected final EntityConfig entityConfig;
    protected final List<String> localSearchableFields;
    protected final List<String> relationSearchableFields;
    protected final Class<DOMAIN> domainType;

    @Autowired(required = false)
    protected HistoryEventsRecorder historyRecorder;

    @Autowired(required = false)
    protected FilterSpecificationBuilder filterSpecificationBuilder;

    @Autowired(required = false)
    protected OfflineChangeBroadcaster offlineChangeBroadcaster;

    @Autowired(required = false)
    protected OfflineRevisionTracker offlineRevisionTracker;

    /**
     * Primary constructor accepting the full {@link EntityConfig}.
     */
    public BaseService(SearchableRepository<DOMAIN, ID> repository, BaseMapper<DOMAIN, DTO> mapper,
            EntityConfig entityConfig) {
        this.repository = repository;
        this.mapper = mapper;
        this.entityConfig = entityConfig;
        this.localSearchableFields = entityConfig.getLocalSearchableFields();
        this.relationSearchableFields = entityConfig.getRelationSearchableFields();
        @SuppressWarnings("unchecked")
        Class<DOMAIN> resolvedDomainType = (Class<DOMAIN>) ResolvableType.forClass(getClass())
                .as(BaseService.class)
                .getGeneric(1)
                .resolve();
        if (resolvedDomainType == null) {
            throw new IllegalStateException("Failed to resolve BaseService domain type for " + getClass().getName());
        }
        this.domainType = resolvedDomainType;

        assertNoCrudOverrides();
    }

    /**
     * Constructor with separately configured local and relation search fields.
     */
    public BaseService(SearchableRepository<DOMAIN, ID> repository, BaseMapper<DOMAIN, DTO> mapper,
            List<String> localSearchableFields, List<String> relationSearchableFields) {
        this(repository, mapper, EntityConfig.builder()
                .localSearchableFields(localSearchableFields)
                .relationSearchableFields(relationSearchableFields)
                .build());
    }

    /**
     * Constructor for entities that only search their own keyword fields.
     */
    public BaseService(SearchableRepository<DOMAIN, ID> repository, BaseMapper<DOMAIN, DTO> mapper,
            List<String> localSearchableFields) {
        this(repository, mapper, localSearchableFields, Collections.emptyList());
    }

    /**
     * Constructor without searchable fields (empty list).
     */
    public BaseService(SearchableRepository<DOMAIN, ID> repository, BaseMapper<DOMAIN, DTO> mapper) {
        this(repository, mapper, Collections.emptyList(), Collections.emptyList());
    }

    public Page<DTO> findAll(SearchablePageable pageable) {
        return findAll(pageable, null);
    }

    public Page<DTO> findAll(SearchablePageable pageable, QueryFilterCriteria filterRequest) {
        Specification<DOMAIN> specification = notDeletedSpecification();

        if (pageable.hasSearchText() && hasSearchableFields()) {
            specification = specification.and(makeSearchSpecification(pageable.getSearchText()));
        }

        if (filterRequest != null && filterSpecificationBuilder != null) {
            specification = specification.and(
                    filterSpecificationBuilder.build(domainType, filterRequest));
        }

        return repository.findAll(specification, pageable.getPageable()).map(mapper::toDto);
    }

    /**
     * Perform search using the configured searchable fields.
     * Returns null if no searchable fields are defined.
     */
    protected Page<DTO> performSearch(String searchText, Pageable pageable) {
        if (!hasSearchableFields()) {
            return null; // No searchable fields defined
        }
        Specification<DOMAIN> specification = notDeletedSpecification().and(makeSearchSpecification(searchText));
        return repository.findAll(specification, pageable).map(mapper::toDto);
    }

    public DTO getById(ID id) {
        DOMAIN domain = repository.findById(id)
                .filter(entity -> !isHidden(entity))
                .orElseThrow(() -> RestUtils.notFound("id", String.valueOf(id)));
        return mapper.toDto(domain);
    }

    @Transactional
    public DTO create(DTO dto) {
        validateCreateRequest(dto);
        DOMAIN domain = buildCreateDomain(dto);
        DOMAIN saved = repository.saveAndFlush(domain);
        return finalizeCreatedEntity(saved);
    }

    @Transactional
    public DTO update(ID id, DTO dto) {
        validateUpdateRequest(id, dto);
        DOMAIN domain = findUpdateDomain(id);

        DTO previousDto = snapshotForHistory(domain);
        applyUpdateChanges(domain, dto);
        DOMAIN saved = repository.saveAndFlush(domain);
        return finalizeUpdatedEntity(saved, previousDto);
    }

    @Transactional
    public void delete(ID id) {
        validateDeleteRequest(id);
        DOMAIN domain = findDeleteDomain(id);

        DTO previousDto = snapshotForHistory(domain);
        performDelete(domain);

        finalizeDeletedEntity(domain, previousDto);
    }

    protected void validateCreateRequest(DTO dto) {
        // Default implementation does nothing.
    }

    protected void validateUpdateRequest(ID id, DTO dto) {
        // Default implementation does nothing.
    }

    protected void validateDeleteRequest(ID id) {
        // Default implementation does nothing.
    }

    protected DOMAIN buildCreateDomain(DTO dto) {
        DOMAIN domain = mapper.toDomain(dto);
        applyRelations(domain, dto);
        populateKeywords(domain);
        return domain;
    }

    protected DOMAIN findUpdateDomain(ID id) {
        return repository.findById(id)
                .orElseThrow(() -> RestUtils.notFound("id", String.valueOf(id)));
    }

    protected void applyUpdateChanges(DOMAIN domain, DTO dto) {
        mapper.update(dto, domain);
        applyRelations(domain, dto);
        populateKeywords(domain);
    }

    protected DOMAIN findDeleteDomain(ID id) {
        return repository.findById(id)
                .filter(entity -> !isHidden(entity))
                .orElseThrow(() -> RestUtils.notFound("id", String.valueOf(id)));
    }

    protected void performDelete(DOMAIN domain) {
        if (entityConfig.isSoftDelete()) {
            domain.setDeleted(true);
            repository.saveAndFlush(domain);
            return;
        }

        repository.delete(domain);
    }

    protected final DTO finalizeCreatedEntity(DOMAIN saved) {
        DTO createdDto = mapper.toDto(saved);
        publishEntityChange("create", createdDto);
        return createdDto;
    }

    protected final DTO finalizeUpdatedEntity(DOMAIN saved, DTO previousDto) {
        DTO updatedDto = mapper.toDto(saved);
        recordUpdate(saved, previousDto, updatedDto);
        publishEntityChange("update", updatedDto);
        return updatedDto;
    }

    protected final void finalizeDeletedEntity(DOMAIN domain, DTO previousDto) {
        recordDelete(domain, previousDto);
        publishEntityChange("delete", previousDto);
    }

    private void assertNoCrudOverrides() {
        for (Method method : getClass().getDeclaredMethods()) {
            if (method.isBridge() || method.isSynthetic()) {
                continue;
            }

            if (isForbiddenCrudOverride(method)) {
                throw new IllegalStateException(
                        "Do not override BaseService CRUD entry points in " + getClass().getName()
                                + ". Use template hooks (validate*/build*/find*/apply*/performDelete) instead.");
            }
        }
    }

    private boolean isForbiddenCrudOverride(Method method) {
        return ("create".equals(method.getName()) && method.getParameterCount() == 1)
                || ("update".equals(method.getName()) && method.getParameterCount() == 2)
                || ("delete".equals(method.getName()) && method.getParameterCount() == 1);
    }

    /**
     * Whether the entity should be treated as absent for reads. Soft-deleted
     * rows are hidden; physical-delete entities are never hidden.
     */
    protected boolean isHidden(DOMAIN domain) {
        return entityConfig.isSoftDelete() && domain.isDeleted();
    }

    /**
     * Restricts queries to non-deleted rows when soft delete is enabled.
     */
    protected Specification<DOMAIN> notDeletedSpecification() {
        if (!entityConfig.isSoftDelete()) {
            return (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();
        }
        return (root, query, criteriaBuilder) -> criteriaBuilder.isFalse(root.get("deleted"));
    }

    /**
     * Captures the current persisted state as a DTO for history, or null when
     * the entity does not record history.
     */
    protected DTO snapshotForHistory(DOMAIN domain) {
        return entityConfig.recordsHistory() ? mapper.toDto(domain) : null;
    }

    protected void recordCreate(DOMAIN saved, DTO currentDto) {
        if (canRecordHistory()) {
            historyRecorder.recordCreate(entityConfig.getHistory(), extractId(saved), currentDto);
        }
    }

    protected void recordUpdate(DOMAIN saved, DTO previousDto, DTO currentDto) {
        if (canRecordHistory()) {
            historyRecorder.recordUpdate(entityConfig.getHistory(), extractId(saved), previousDto, currentDto);
        }
    }

    protected void recordDelete(DOMAIN domain, DTO previousDto) {
        if (canRecordHistory()) {
            historyRecorder.recordDelete(entityConfig.getHistory(), extractId(domain), previousDto);
        }
    }

    private boolean canRecordHistory() {
        return entityConfig.recordsHistory() && historyRecorder != null;
    }

    protected String extractId(DOMAIN domain) {
        String idFieldName = findIdFieldName(domain.getClass());
        if (idFieldName == null) {
            return null;
        }
        Object value = extractFieldValue(domain, idFieldName);
        return value == null ? null : String.valueOf(value);
    }

    /**
     * Hook for entity-specific relation wiring and save-time adjustments.
     */
    protected void applyRelations(DOMAIN domain, DTO dto) {
        // Default implementation does nothing.
    }

    /**
     * Populate the keywords field from searchable fields.
     */
    protected void populateKeywords(DOMAIN domain) {
        if (localSearchableFields.isEmpty()) {
            return;
        }

        try {
            String keywords = localSearchableFields.stream()
                    .map(fieldName -> extractFieldValue(domain, fieldName))
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .filter(value -> value != null && !value.isBlank())
                    .collect(Collectors.joining(" "));

            domain.setKeywords(keywords);
        } catch (Exception e) {
            log.warn("Failed to populate keywords for entity {}", domain.getClass().getSimpleName(), e);
        }
    }

    private Specification<DOMAIN> makeSearchSpecification(String searchText) {
        return (root, query, criteriaBuilder) -> {
            // No DISTINCT here: makeChunkPredicate only ever joins to-one relations, so rows are never
            // duplicated, and DISTINCT would make Postgres reject sorting by a joined column.
            String[] chunks = searchText.trim().toLowerCase(Locale.ROOT).split("\\s+");
            List<Predicate> chunkPredicates = Arrays.stream(chunks)
                    .filter(chunk -> !chunk.isBlank())
                    .map(chunk -> makeChunkPredicate(root, criteriaBuilder, chunk))
                    .filter(Objects::nonNull)
                    .toList();

            if (chunkPredicates.isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.and(chunkPredicates.toArray(Predicate[]::new));
        };
    }

    private Predicate makeChunkPredicate(jakarta.persistence.criteria.Root<DOMAIN> root,
            jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder, String chunk) {
        String normalizedSearchText = "%" + chunk + "%";
        List<Predicate> predicates = new ArrayList<>();

        if (!localSearchableFields.isEmpty()) {
            predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("keywords").as(String.class)),
                    normalizedSearchText));
        }

        for (String relationFieldName : relationSearchableFields) {
            Field relationField = findField(root.getJavaType(), relationFieldName);

            if (relationField == null) {
                log.warn("Could not find searchable relation field {} on {}", relationFieldName,
                        root.getJavaType().getSimpleName());
                continue;
            }

            if (!BaseEntity.class.isAssignableFrom(relationField.getType())) {
                log.warn("Searchable relation field {} on {} is not auditable", relationFieldName,
                        root.getJavaType().getSimpleName());
                continue;
            }

            var join = root.join(relationFieldName, JoinType.LEFT);
            predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(join.get("keywords").as(String.class)),
                    normalizedSearchText));

            String idFieldName = findIdFieldName(relationField.getType());
            if (idFieldName != null) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(join.get(idFieldName).cast(String.class)),
                        normalizedSearchText));
            }
        }

        if (predicates.isEmpty()) {
            return null;
        }

        return criteriaBuilder.or(predicates.toArray(Predicate[]::new));
    }

    private boolean hasSearchableFields() {
        return !localSearchableFields.isEmpty() || !relationSearchableFields.isEmpty();
    }

    /**
     * Extract field value from domain object using reflection.
     */
    private Object extractFieldValue(DOMAIN domain, String fieldName) {
        try {
            Field field = findField(domain.getClass(), fieldName);

            if (field == null) {
                return null;
            }

            field.setAccessible(true);
            return field.get(domain);
        } catch (IllegalAccessException e) {
            log.debug("Could not extract field {} from {}", fieldName, domain.getClass().getSimpleName());
            return null;
        }
    }

    private Field findField(Class<?> type, String fieldName) {
        Class<?> currentType = type;

        while (currentType != null && currentType != Object.class) {
            try {
                return currentType.getDeclaredField(fieldName);
            } catch (NoSuchFieldException e) {
                currentType = currentType.getSuperclass();
            }
        }

        return null;
    }

    private String findIdFieldName(Class<?> type) {
        Class<?> currentType = type;

        while (currentType != null && currentType != Object.class) {
            for (Field field : currentType.getDeclaredFields()) {
                if (field.isAnnotationPresent(Id.class)) {
                    return field.getName();
                }
            }

            currentType = currentType.getSuperclass();
        }

        return null;
    }

    protected void publishEntityChange(String action, DTO dto) {
        if (dto == null || action == null) {
            return;
        }

        String entityName = domainType.getSimpleName();
        Long revision = null;

        if (offlineRevisionTracker != null) {
            long bumpedRevision = offlineRevisionTracker.bump(toOfflineEntityKey(entityName));
            if (bumpedRevision > 0) {
                revision = bumpedRevision;
            }
        }

        if (offlineChangeBroadcaster == null) {
            return;
        }

        switch (action) {
            case "create":
                offlineChangeBroadcaster.publishCreateEvent(entityName, dto, revision);
                break;
            case "update":
                offlineChangeBroadcaster.publishUpdateEvent(entityName, dto, revision);
                break;
            case "delete":
                offlineChangeBroadcaster.publishDeleteEvent(entityName, dto, revision);
                break;
            default:
                break;
        }
    }

    private String toOfflineEntityKey(String entityName) {
        if (entityName == null || entityName.isBlank()) {
            return "";
        }

        return Character.toLowerCase(entityName.charAt(0)) + entityName.substring(1);
    }
}
