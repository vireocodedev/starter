package com.vireocode.starter.queryengine.savedfilter;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.vireocode.starter.auth.StarterUser;
import com.vireocode.starter.auth.StarterUserDetails;
import com.vireocode.starter.auth.StarterUserRepository;
import com.vireocode.starter.base.BaseService;
import com.vireocode.starter.base.EntityConfig;
import com.vireocode.starter.queryengine.QueryEngineRegistry;
import com.vireocode.starter.web.RestUtils;

@Service
public class SavedFilterService extends BaseService<Long, SavedFilter, SavedFilterDTO> {

    private final StarterUserRepository userRepository;
    private final SavedFilterRepository savedFilterRepository;
    private final QueryEngineRegistry registry;

    public SavedFilterService(
            SavedFilterRepository repository,
            SavedFilterMapper mapper,
            StarterUserRepository userRepository,
            QueryEngineRegistry registry) {
        super(repository, mapper, EntityConfig.builder()
                .localSearchableFields(List.of("name", "description", "entityName", "engineVersion"))
                .relationSearchableFields(List.of("user"))
                .softDelete(true)
                .build());
        this.userRepository = userRepository;
        this.savedFilterRepository = repository;
        this.registry = registry;
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
    protected void applyRelations(SavedFilter savedFilter, SavedFilterDTO dto) {
        if (savedFilter.getEntityName() != null) {
            savedFilter.setEntityName(savedFilter.getEntityName().trim().toUpperCase());
        }

        if (dto.getUserId() != null) {
            savedFilter.setUser(getUserById(dto.getUserId()));
            return;
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

    private StarterUser getUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> RestUtils.notFound("userId", userId.toString()));
    }
}
