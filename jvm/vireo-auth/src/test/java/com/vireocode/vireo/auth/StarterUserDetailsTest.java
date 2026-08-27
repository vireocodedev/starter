package com.vireocode.vireo.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

class StarterUserDetailsTest {

    @Test
    void resolveRole_WithNoRoleAuthority_Throws() {
        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> StarterUserDetails.resolveRole(List.of(new SimpleGrantedAuthority("SCOPE_read"))));

        assertEquals("User has no role authority", exception.getMessage());
    }

    @Test
    void resolveRole_StripsThePrefixOfAnyRole() {
        assertEquals("SUPERADMIN",
                StarterUserDetails.resolveRole(List.of(new SimpleGrantedAuthority("ROLE_SUPERADMIN"))));
        assertEquals("USER",
                StarterUserDetails.resolveRole(List.of(new SimpleGrantedAuthority("ROLE_USER"))));
    }

    @Test
    void resolveRole_AcceptsARoleTheStarterHasNeverHeardOf() {
        assertEquals("AUDITOR",
                StarterUserDetails.resolveRole(List.of(new SimpleGrantedAuthority("ROLE_AUDITOR"))));
    }

    @Test
    void getAuthorities_PrefixesTheStoredRole() {
        StarterUser user = new StarterUser(UUID.randomUUID(), "demo", "hash", "AUDITOR", true);

        StarterUserDetails details = new StarterUserDetails(user);

        assertEquals(List.of(new SimpleGrantedAuthority("ROLE_AUDITOR")), details.getAuthorities());
        assertEquals("AUDITOR", details.getRole());
    }
}
