package com.vireocode.vireo.security;

/**
 * Authorization expressions the starter itself uses.
 *
 * <p>
 * Deliberately role-free. The starter has no opinion on what roles an
 * application defines, so its own endpoints ask only for an authenticated
 * principal. Applications narrow that further with their own expression
 * constants, or with request matchers in their security configuration.
 */
public final class SecurityExpressions {

    public static final String IS_AUTHENTICATED = "isAuthenticated()";
    public static final String PERMIT_ALL = "permitAll()";

    private SecurityExpressions() {
    }
}
