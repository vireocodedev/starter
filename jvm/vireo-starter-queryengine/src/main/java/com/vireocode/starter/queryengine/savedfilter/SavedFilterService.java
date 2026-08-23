package com.vireocode.starter.queryengine.savedfilter;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;

import com.vireocode.starter.auth.StarterUser;
import com.vireocode.starter.auth.StarterUserDetails;
import com.vireocode.starter.auth.StarterUserRepository;
import com.vireocode.starter.base.BaseService;
import com.vireocode.starter.base.EntityConfig;
import com.vireocode.starter.queryengine.QueryEngineRegistry;
import com.vireocode.starter.queryengine.QueryEngineFilterSpecificationBuilder;
import com.vireocode.starter.queryengine.QueryFilterRequest;
import com.vireocode.starter.web.RestUtils;
import com.vireocode.starter.web.SearchablePageable;

import jakarta.persistence.criteria.Predicate;

public class SavedFilterService extends BaseService<Long, SavedFilter, SavedFilterDTO> {

    private final StarterUserRepository userRepository;
    private final SavedFilterRepository savedFilterRepository;
    private final QueryEngineRegistry registry;
    private final QueryEngineFilterSpecificationBuilder filterSpecificationBuilder;

    public SavedFilterService(
            SavedFilterRepository repository,
            SavedFilterMapper mapper,
            StarterUserRepository userRepository,
            QueryEngineRegistry registry,
            QueryEngineFilterSpecificationBuilder filterSpecificationBuilder) {
        super(repository, mapper, EntityConfig.builder()
                .localSearchableFields(List.of("name", "description", "entityName", "engineVersion"))
                .relationSearchableFields(List.of("user"))
                .softDelete(true)
                .build());
        this.userRepository = userRepository;
        this.savedFilterRepository = repository;
        this.registry = registry;
        this.filterSpecificationBuilder = filterSpecificationBuilder;
    }

    @Override
    public Page<SavedFilterDTO> findAll(SearchablePageable pageable) {
        return findVisible(pageable, null);
    }

    @Override
    public Page<SavedFilterDTO> findAll(SearchablePageable pageable,
            com.vireocode.starter.spi.QueryFilterCriteria filterRequest) {
        if (filterRequest != null && !(filterRequest instanceof QueryFilterRequest)) {
            throw RestUtils.badRequest("Unsupported saved-filter criteria");
        }
        return findVisible(pageable, (QueryFilterRequest) filterRequest);
    }

    private Page<SavedFilterDTO> findVisible(SearchablePageable pageable, QueryFilterRequest filterRequest) {
        StarterUser currentUser = getCurrentUser();
        Specification<SavedFilter> specification = visibleTo(currentUser.getId());

        if (pageable.hasSearchText()) {
            specification = specification.and(search(pageable.getSearchText()));
        }
        if (filterRequest != null) {
            specification = specification.and(filterSpecificationBuilder.build(SavedFilter.class, filterRequest));
        }

        return savedFilterRepository.findAll(specification, pageable.getPageable()).map(mapper::toDto);
    }

    @Override
    public SavedFilterDTO getById(Long id) {
        StarterUser currentUser = getCurrentUser();
        return savedFilterRepository.findOne(visibleTo(currentUser.getId()).and(byId(id)))
                .map(mapper::toDto)
                .orElseThrow(() -> RestUtils.notFound("id", String.valueOf(id)));
    }

    public SavedFilterDTO findDefaultByEntityName(String entityName) {
        if (entityName == null || entityName.isBlank()) {
            return null;
        }

        String normalized = entityName.trim().toUpperCase();
        StarterUser currentUser = getCurrentUser();

        return savedFilterRepository
                .findTopByEntityNameAndIsDefaultTrueAndUserIdAndDeletedFalseOrderByCreatedAtDesc(normalized,
                        currentUser.getId())
                .or(() -> savedFilterRepository
                        .findTopByEntityNameAndIsDefaultTrueAndIsPublicTrueAndDeletedFalseOrderByCreatedAtDesc(
                                normalized))
                .map(mapper::toDto)
                .orElse(null);
    }

    @Override
    protected void validateCreateRequest(SavedFilterDTO dto) {
        requireKnownEntityName(dto);
    }

    @Override
    protected void validateUpdateRequest(Long id, SavedFilterDTO dto) {
        requireKnownEntityName(dto);
    }

    @Override
    protected SavedFilter findUpdateDomain(Long id) {
        return requireOwned(id);
    }

    @Override
    protected SavedFilter findDeleteDomain(Long id) {
        return requireOwned(id);
    }

    @Override
    protected void applyRelations(SavedFilter savedFilter, SavedFilterDTO dto) {
        if (savedFilter.getEntityName() != null) {
            savedFilter.setEntityName(savedFilter.getEntityName().trim().toUpperCase());
        }

        if (savedFilter.getUser() == null) {
            savedFilter.setUser(getCurrentUser());
        }
    }

    /**
     * A saved filter is meaningless against an entity the query engine cannot
     * resolve, so the key is checked against the registry rather than against a
     * fixed list.
     */
    private void requireKnownEntityName(SavedFilterDTO dto) {
        try {
            registry.requireEntityType(dto.getEntityName());
        } catch (IllegalArgumentException exception) {
            throw RestUtils.badRequest("Unknown query engine entity: " + dto.getEntityName());
        }
    }

    private StarterUser getCurrentUser() {
        String username = RestUtils.getCurrentPrincipal(StarterUserDetails.class)
                .orElseThrow(() -> RestUtils.unauthorized("Unauthorized"))
                .getUsername();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> RestUtils.unauthorized("Unauthorized"));
    }

    private SavedFilter requireOwned(Long id) {
        UUID userId = getCurrentUser().getId();
        return savedFilterRepository.findOne(notDeletedSpecification().and(byId(id)).and(ownedBy(userId)))
                .orElseThrow(() -> RestUtils.notFound("id", String.valueOf(id)));
    }

    private Specification<SavedFilter> visibleTo(UUID userId) {
        return notDeletedSpecification().and((root, query, criteriaBuilder) -> criteriaBuilder.or(
                criteriaBuilder.equal(root.get("user").get("id"), userId),
                criteriaBuilder.isTrue(root.get("isPublic"))));
    }

    private Specification<SavedFilter> ownedBy(UUID userId) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("user").get("id"), userId);
    }

    private Specification<SavedFilter> byId(Long id) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("id"), id);
    }

    private Specification<SavedFilter> search(String searchText) {
        List<String> chunks = List.of(searchText.trim().toLowerCase(Locale.ROOT).split("\\s+"));
        return (root, query, criteriaBuilder) -> {
            List<Predicate> chunkPredicates = chunks.stream()
                    .filter(chunk -> !chunk.isBlank())
                    .map(chunk -> criteriaBuilder.or(
                            criteriaBuilder.like(criteriaBuilder.lower(root.get("keywords")), "%" + chunk + "%"),
                            criteriaBuilder.like(criteriaBuilder.lower(root.get("user").get("keywords")),
                                    "%" + chunk + "%")))
                    .toList();
            return criteriaBuilder.and(chunkPredicates.toArray(Predicate[]::new));
        };
    }
}
