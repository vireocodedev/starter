/**
 * Replaceable session-authentication contracts and the default database user model.
 *
 * <p>
 * Supported consumer APIs are the immutable HTTP request and response records,
 * {@link com.vireocode.auth.StarterAuthProperties},
 * {@link com.vireocode.auth.StarterHttpSecurityCustomizer}, and—only
 * when deliberately using the default database store—
 * {@link com.vireocode.auth.StarterUser} with
 * {@link com.vireocode.auth.StarterUserRepository}. Controllers and the
 * database {@code UserDetailsService} remain implementation details.
 */
package com.vireocode.auth;
