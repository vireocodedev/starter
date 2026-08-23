package com.vireocode.starter.auth;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

/**
 * Lets a consumer add to the starter's default security chain without replacing
 * it.
 *
 * <p>
 * Replacing the whole {@code SecurityFilterChain} is always available and is
 * the
 * right move when the authentication model genuinely differs. It is the wrong
 * move when all that is wanted is one more public path, and forcing that choice
 * is how library security configuration ends up copy-pasted and then drifting.
 * Every customizer bean is applied to the default chain in
 * {@code @Order} sequence before the library's authenticated API matcher and
 * permissive final fallback. This lets an application publish a narrower API
 * route without replacing the complete chain.
 */
@FunctionalInterface
public interface StarterHttpSecurityCustomizer {

    void customize(HttpSecurity http) throws Exception;
}
