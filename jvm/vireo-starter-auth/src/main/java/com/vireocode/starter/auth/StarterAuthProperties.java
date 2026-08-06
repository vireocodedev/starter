package com.vireocode.starter.auth;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration for the starter's default authentication stack.
 *
 * <p>
 * Everything here exists because it was previously hard-coded in an application
 * rather than in a library. A role name, a login path or a docs matcher is the
 * consumer's business, so each one is a property instead of a constant that
 * would force a fork to change.
 */
@ConfigurationProperties("vireo.starter.auth")
public class StarterAuthProperties {

    /**
     * Path the default login endpoint is published on, and left unauthenticated.
     */
    private String loginPath = "/api/auth/login";

    /** Path the default logout endpoint is published on. */
    private String logoutPath = "/api/auth/logout";

    /** Prefix under which the starter's endpoints require an authenticated user. */
    private String apiPathPattern = "/api/**";

    /** Request matchers treated as API documentation. */
    private List<String> docsMatchers = new ArrayList<>(
            List.of("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**"));

    /**
     * Role required to read the API documentation. Empty means any authenticated
     * user may read it. The library never publishes documentation anonymously; a
     * consumer who wants that says so with a
     * {@link StarterHttpSecurityCustomizer}.
     */
    private String docsRole = "";

    public String getLoginPath() {
        return loginPath;
    }

    public void setLoginPath(String loginPath) {
        this.loginPath = loginPath;
    }

    public String getLogoutPath() {
        return logoutPath;
    }

    public void setLogoutPath(String logoutPath) {
        this.logoutPath = logoutPath;
    }

    public String getApiPathPattern() {
        return apiPathPattern;
    }

    public void setApiPathPattern(String apiPathPattern) {
        this.apiPathPattern = apiPathPattern;
    }

    public List<String> getDocsMatchers() {
        return docsMatchers;
    }

    public void setDocsMatchers(List<String> docsMatchers) {
        this.docsMatchers = docsMatchers;
    }

    public String getDocsRole() {
        return docsRole;
    }

    public void setDocsRole(String docsRole) {
        this.docsRole = docsRole;
    }
}
