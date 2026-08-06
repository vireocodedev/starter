/**
 * The seams that {@code vireo-starter-core} declares and the optional modules
 * fill in.
 *
 * <p>
 * Core deliberately does not depend on {@code vireo-starter-queryengine} or
 * {@code vireo-starter-offline}. It only knows that <em>something</em> may be
 * able to compile a filter payload into a {@code Specification}, and that
 * <em>something</em> may want to hear about entity changes. Both are optional:
 * {@code BaseService} injects them with {@code required = false} and
 * null-checks
 * every call, so a consumer can take the CRUD base on its own.
 *
 * <p>
 * A consumer replacing a module replaces the interface, not the class.
 */
package com.vireocode.starter.spi;
