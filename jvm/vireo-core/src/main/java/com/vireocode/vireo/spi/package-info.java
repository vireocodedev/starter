/**
 * The seams that {@code vireo-core} declares and the optional modules
 * fill in.
 *
 * <p>
 * Core deliberately does not depend on {@code vireo-query} or
 * {@code vireo-offline}. It only knows that <em>something</em> may be
 * able to compile a filter payload into a {@code Specification}, and that
 * <em>something</em> may want to hear about entity changes. Filtering and
 * offline delivery are optional. History becomes required only for a service
 * whose entity configuration explicitly enables it; a missing recorder aborts
 * the operation instead of silently losing an audit record.
 *
 * <p>
 * A consumer replacing a module replaces the interface, not the class.
 */
package com.vireocode.vireo.spi;
