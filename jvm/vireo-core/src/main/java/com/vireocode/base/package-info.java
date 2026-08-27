/**
 * Reusable JPA CRUD mechanics for application-owned aggregates.
 *
 * <p>
 * {@link com.vireocode.base.BaseEntity} supplies auditing, keyword, and
 * soft-delete columns. A consumer pairs it with a
 * {@link com.vireocode.base.BaseMapper},
 * {@link com.vireocode.base.SearchableRepository}, and one
 * {@link com.vireocode.base.EntityConfig} on a
 * {@link com.vireocode.base.BaseService} subclass. Public CRUD methods
 * preserve the shared lifecycle; protected template hooks are the supported
 * customization boundary.
 */
package com.vireocode.base;
