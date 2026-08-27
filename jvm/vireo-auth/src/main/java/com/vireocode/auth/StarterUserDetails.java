package com.vireocode.auth;

import java.io.Serial;
import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Adapts an {@link StarterUser} to Spring Security.
 *
 * <p>
 * The role is carried as a plain string. Which strings are valid is the
 * application's business, so nothing here validates against a fixed set.
 */
public class StarterUserDetails implements UserDetails, Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    public static final String ROLE_PREFIX = "ROLE_";

    private final UUID id;
    private final String username;
    private final String passwordHash;
    private final String role;
    private final boolean enabled;

    public StarterUserDetails(StarterUser user) {
        Objects.requireNonNull(user, "user must not be null");
        this.id = user.getId();
        this.username = user.getUsername();
        this.passwordHash = user.getPasswordHash();
        this.role = user.getRole();
        this.enabled = user.isEnabled();
    }

    public UUID getId() {
        return id;
    }

    public String getRole() {
        return role;
    }

    /**
     * Recovers the role from a set of granted authorities by stripping the
     * {@code ROLE_} prefix. A principal built by this class always carries
     * exactly one such authority.
     */
    public static String resolveRole(Collection<? extends GrantedAuthority> authorities) {
        return authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority != null && authority.startsWith(ROLE_PREFIX))
                .map(authority -> authority.substring(ROLE_PREFIX.length()))
                .filter(role -> !role.isBlank())
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("User has no role authority"));
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(ROLE_PREFIX + role));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public String toString() {
        return "StarterUserDetails[username=" + getUsername() + "]";
    }
}
