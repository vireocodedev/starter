/**
 * Module-isolated Flyway migration contracts.
 *
 * <p>
 * Every library module owns a validated resource namespace and a dedicated
 * Flyway history table. Consumer migrations remain in the consumer's ordinary
 * history so independently released version sequences cannot collide.
 */
package com.vireocode.flyway;
