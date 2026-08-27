package com.vireocode.vireo.queryengine.savedfilter;

import java.util.Optional;
import java.util.UUID;

import com.vireocode.vireo.base.SearchableRepository;

public interface SavedFilterRepository extends SearchableRepository<SavedFilter, Long> {
    Optional<SavedFilter> findTopByEntityNameAndIsDefaultTrueAndUserIdAndDeletedFalseOrderByCreatedAtDesc(
            String entityName,
            UUID userId);

    Optional<SavedFilter> findTopByEntityNameAndIsDefaultTrueAndIsPublicTrueAndDeletedFalseOrderByCreatedAtDesc(
            String entityName);
}
