package com.vireocode.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

class RestUtilsTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void factoryExceptions_MapToExpectedStatusesAndMessages() {
        assertStatus(RestUtils.notFound("id", "7"), 404, "Entity with id=7 not found");
        assertStatus(RestUtils.badRequest("bad"), 400, "bad");
        assertStatus(RestUtils.forbidden("forbidden"), 403, "forbidden");
        assertStatus(RestUtils.conflict("conflict"), 409, "conflict");
        assertStatus(RestUtils.unauthorized("unauthorized"), 401, "unauthorized");
        assertStatus(RestUtils.internalServerError("internal"), 500, "internal");
        assertStatus(RestUtils.notImplemented("todo"), 501, "todo");
    }

    @Test
    void makePageable_UsesSortDirectionAndRowsPerPageRules() {
        SearchablePageable asc = RestUtils.makePageable(1, 20, "name", "asc", "abc");
        assertEquals(1, asc.getPageable().getPageNumber());
        assertEquals(20, asc.getPageable().getPageSize());
        assertEquals(Sort.Direction.ASC, asc.getPageable().getSort().getOrderFor("name").getDirection());

        SearchablePageable desc = RestUtils.makePageable(0, 10, "id", "desc", null);
        assertEquals(Sort.Direction.DESC, desc.getPageable().getSort().getOrderFor("id").getDirection());

        SearchablePageable uppercase = RestUtils.makePageable(0, 10, "id", "DESC", null);
        assertEquals(Sort.Direction.DESC, uppercase.getPageable().getSort().getOrderFor("id").getDirection());

        SearchablePageable maxRows = RestUtils.makePageable(0, -1, "id", "asc", null);
        assertEquals(Integer.MAX_VALUE, maxRows.getPageable().getPageSize());
    }

    @Test
    void makePageable_RejectsInvalidPublicRequestParametersAsBadRequests() {
        assertStatus(assertThrows(ResponseStatusException.class,
                () -> RestUtils.makePageable(-1, 10, "id", "asc", null)), 400,
                "page must be greater than or equal to zero");
        assertStatus(assertThrows(ResponseStatusException.class,
                () -> RestUtils.makePageable(0, 0, "id", "asc", null)), 400,
                "rowsPerPage must be greater than zero or exactly -1");
        assertStatus(assertThrows(ResponseStatusException.class,
                () -> RestUtils.makePageable(0, -2, "id", "asc", null)), 400,
                "rowsPerPage must be greater than zero or exactly -1");
        assertStatus(assertThrows(ResponseStatusException.class,
                () -> RestUtils.makePageable(0, 10, " ", "asc", null)), 400,
                "sortBy must not be blank");
        assertStatus(assertThrows(ResponseStatusException.class,
                () -> RestUtils.makePageable(0, 10, "id", "sideways", null)), 400,
                "sortDirection must be asc or desc");
    }

    @Test
    void getCurrentPrincipal_CoversAllBranches() {
        SecurityContextHolder.clearContext();
        Optional<String> missing = RestUtils.getCurrentPrincipal(String.class);
        assertTrue(missing.isEmpty());

        TestingAuthenticationToken notAuth = new TestingAuthenticationToken("demo", "x");
        notAuth.setAuthenticated(false);
        SecurityContextHolder.getContext().setAuthentication(notAuth);
        Optional<String> unauthenticated = RestUtils.getCurrentPrincipal(String.class);
        assertTrue(unauthenticated.isEmpty());

        AnonymousAuthenticationToken anonymous = new AnonymousAuthenticationToken(
                "key", "anonymousUser", AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS"));
        SecurityContextHolder.getContext().setAuthentication(anonymous);
        assertTrue(RestUtils.getCurrentPrincipal(String.class).isEmpty());

        TestingAuthenticationToken wrongType = new TestingAuthenticationToken(123, "x", "ROLE_USER");
        SecurityContextHolder.getContext().setAuthentication(wrongType);
        Optional<String> wrong = RestUtils.getCurrentPrincipal(String.class);
        assertTrue(wrong.isEmpty());

        TestingAuthenticationToken ok = new TestingAuthenticationToken("demo", "x", "ROLE_USER");
        SecurityContextHolder.getContext().setAuthentication(ok);
        Optional<String> found = RestUtils.getCurrentPrincipal(String.class);
        assertTrue(found.isPresent());
        assertEquals("demo", found.get());

        assertThrows(IllegalArgumentException.class, () -> RestUtils.getCurrentPrincipal(null));
    }

    private void assertStatus(ResponseStatusException exception, int status, String message) {
        assertEquals(status, exception.getStatusCode().value());
        assertEquals(message, exception.getReason());
    }
}
