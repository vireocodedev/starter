package com.vireocode.vireo.queryengine;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

/** Fail-closed policy installed until an application supplies row-level relation-option authorization. */
final class DenyAllQueryRelationOptionPolicy implements QueryRelationOptionPolicy {

    @Override
    public Predicate scope(Authentication authentication, QueryRelationOptionContext context, Root<?> root,
            CriteriaBuilder criteriaBuilder) {
        throw new AccessDeniedException("Relation-option queries require an application QueryRelationOptionPolicy");
    }
}
