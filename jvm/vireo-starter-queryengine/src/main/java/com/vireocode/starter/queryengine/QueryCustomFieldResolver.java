package com.vireocode.starter.queryengine;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

public interface QueryCustomFieldResolver<T> {
    Class<T> supports();

    String fieldPath();

    Predicate buildPredicate(Root<T> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder,
            QueryFilterNode node);
}