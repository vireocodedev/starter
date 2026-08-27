package com.vireocode.vireo.spi;

import org.springframework.data.jpa.domain.Specification;

/**
 * Turns a {@link QueryFilterCriteria} into a JPA {@link Specification}.
 *
 * <p>
 * Implemented by {@code QueryEngineFilterSpecificationBuilder} in
 * {@code vireo-query}. When no implementation is on the
 * classpath, {@code BaseService} ignores the filter argument rather than
 * failing, so filtering degrades to plain search rather than to an error.
 */
public interface FilterSpecificationBuilder {

    /**
     * @return a specification for {@code criteria}. Never {@code null}: criteria
     *         that select everything must yield a conjunction, because
     *         {@code BaseService} composes the result with {@code and}.
     */
    <DOMAIN> Specification<DOMAIN> build(Class<DOMAIN> domainType, QueryFilterCriteria criteria);
}
