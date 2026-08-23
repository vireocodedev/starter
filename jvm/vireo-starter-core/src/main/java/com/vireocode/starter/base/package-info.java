/**
 * Reusable JPA CRUD mechanics for application-owned aggregates.
 *
 * <p>
 * {@link com.vireocode.starter.base.BaseEntity} supplies auditing, keyword, and
 * soft-delete columns. A consumer pairs it with a
 * {@link com.vireocode.starter.base.BaseMapper},
 * {@link com.vireocode.starter.base.SearchableRepository}, and one
 * {@link com.vireocode.starter.base.EntityConfig} on a
 * {@link com.vireocode.starter.base.BaseService} subclass. Public CRUD methods
 * preserve the shared lifecycle; protected template hooks are the supported
 * customization boundary.
 */
package com.vireocode.starter.base;
