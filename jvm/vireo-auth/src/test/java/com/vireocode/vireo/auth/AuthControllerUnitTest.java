package com.vireocode.vireo.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

class AuthControllerUnitTest {

    private static final AuthenticationManager NOOP_AUTHENTICATION_MANAGER = authentication -> authentication;

    private final AuthController controller = new AuthController(NOOP_AUTHENTICATION_MANAGER,
            (authentication, request, response) -> {
            });

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void me_WithNullAuthentication_ThrowsUnauthorized() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.me(null));

        assertEquals(401, exception.getStatusCode().value());
    }

    @Test
    void me_WithUnauthenticatedAuthentication_ThrowsUnauthorized() {
        var unauthenticated = UsernamePasswordAuthenticationToken.unauthenticated("demo", "ignored");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> controller.me(unauthenticated));

        assertEquals(401, exception.getStatusCode().value());
    }

    @Test
    void logout_WithoutSession_ReturnsLoggedOutAndClearsContext() {
        var authenticated = UsernamePasswordAuthenticationToken.authenticated("demo", "ignored",
                java.util.List.of());
        SecurityContextHolder.getContext().setAuthentication(authenticated);

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse httpResponse = new MockHttpServletResponse();
        AuthMessageResponse response = controller.logout(request, httpResponse, authenticated);

        assertEquals("Logged out", response.message());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
