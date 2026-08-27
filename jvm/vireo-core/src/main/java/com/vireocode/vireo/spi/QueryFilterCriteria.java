package com.vireocode.vireo.spi;

/**
 * A filter payload that a {@link FilterSpecificationBuilder} knows how to
 * compile.
 *
 * <p>
 * This exists so that {@code BaseService.findAll} can accept a filter without
 * core depending on the query engine's wire model. The only implementation in
 * the starter is {@code QueryFilterRequest} in
 * {@code vireo-query};
 * an application that ships its own filtering can implement this instead and
 * supply a matching builder.
 */
public interface QueryFilterCriteria {
}
