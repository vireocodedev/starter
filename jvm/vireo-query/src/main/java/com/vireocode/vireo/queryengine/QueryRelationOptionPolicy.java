package com.vireocode.vireo.queryengine;

import org.springframework.security.core.Authentication;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

/**
 * Application-owned authorization and row-scope policy for relation-option queries.
 *
 * <p>The returned predicate is always applied to the target entity query. Implementations may throw an access-denied
 * exception when the caller cannot use the relation field at all. Returning an unrestricted conjunction is an explicit
 * application decision; owner, tenant, deletion, and retention predicates belong here when relevant.
 */
@FunctionalInterface
public interface QueryRelationOptionPolicy {

    Predicate scope(Authentication authentication, QueryRelationOptionContext context, Root<?> root,
            CriteriaBuilder criteriaBuilder);
}
