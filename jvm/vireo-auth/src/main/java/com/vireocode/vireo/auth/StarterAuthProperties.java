package com.vireocode.vireo.auth;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

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
@Validated
public class StarterAuthProperties {

    /** Whether the default login, logout, and current-user endpoints are enabled. */
    private boolean endpointsEnabled = true;

    /** Whether account rename and password-change endpoints are enabled. */
    private boolean accountEndpointsEnabled = true;

    /**
     * Path the default login endpoint is published on, and left unauthenticated.
     */
    @NotBlank
    @Pattern(regexp = "/.*", message = "must begin with '/'")
    private String loginPath = "/api/auth/login";

    /** Path the default logout endpoint is published on. */
    @NotBlank
    @Pattern(regexp = "/.*", message = "must begin with '/'")
    private String logoutPath = "/api/auth/logout";

    /** Path the default current-session endpoint is published on. */
    @NotBlank
    @Pattern(regexp = "/.*", message = "must begin with '/'")
    private String currentUserPath = "/api/auth/me";

    /** Path the default username-change endpoint is published on. */
    @NotBlank
    @Pattern(regexp = "/.*", message = "must begin with '/'")
    private String changeUsernamePath = "/api/account/username";

    /** Path the default password-change endpoint is published on. */
    @NotBlank
    @Pattern(regexp = "/.*", message = "must begin with '/'")
    private String changePasswordPath = "/api/account/password";

    /** Prefix under which the starter's endpoints require an authenticated user. */
    @NotBlank
    private String apiPathPattern = "/api/**";

    /** Request matchers treated as API documentation. */
    private List<@NotBlank String> docsMatchers = new ArrayList<>(
            List.of("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**"));

    /**
     * Role required to read the API documentation. Empty means any authenticated
     * user may read it. The library never publishes documentation anonymously; a
     * consumer who wants that says so with a
     * {@link StarterHttpSecurityCustomizer}.
     */
    private String docsRole = "";

    public boolean isEndpointsEnabled() {
        return endpointsEnabled;
    }

    public void setEndpointsEnabled(boolean endpointsEnabled) {
        this.endpointsEnabled = endpointsEnabled;
    }

    public boolean isAccountEndpointsEnabled() {
        return accountEndpointsEnabled;
    }

    public void setAccountEndpointsEnabled(boolean accountEndpointsEnabled) {
        this.accountEndpointsEnabled = accountEndpointsEnabled;
    }

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

    public String getCurrentUserPath() {
        return currentUserPath;
    }

    public void setCurrentUserPath(String currentUserPath) {
        this.currentUserPath = currentUserPath;
    }

    public String getChangeUsernamePath() {
        return changeUsernamePath;
    }

    public void setChangeUsernamePath(String changeUsernamePath) {
        this.changeUsernamePath = changeUsernamePath;
    }

    public String getChangePasswordPath() {
        return changePasswordPath;
    }

    public void setChangePasswordPath(String changePasswordPath) {
        this.changePasswordPath = changePasswordPath;
    }

    public String getApiPathPattern() {
        return apiPathPattern;
    }

    public void setApiPathPattern(String apiPathPattern) {
        this.apiPathPattern = apiPathPattern;
    }

    public List<@NotBlank String> getDocsMatchers() {
        return docsMatchers;
    }

    public void setDocsMatchers(List<@NotBlank String> docsMatchers) {
        this.docsMatchers = docsMatchers;
    }

    public String getDocsRole() {
        return docsRole;
    }

    public void setDocsRole(String docsRole) {
        this.docsRole = docsRole;
    }

    /** Prevents ambiguous endpoint registration and security rules. */
    @AssertTrue(message = "all authentication endpoint paths must be distinct")
    public boolean isEndpointPathsDistinct() {
        return java.util.stream.Stream.of(
                loginPath, logoutPath, currentUserPath, changeUsernamePath, changePasswordPath)
                .distinct()
                .count() == 5;
    }
}
