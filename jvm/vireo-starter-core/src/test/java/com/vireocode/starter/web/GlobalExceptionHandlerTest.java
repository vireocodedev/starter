package com.vireocode.starter.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;

class GlobalExceptionHandlerTest {

    @Test
    void handleMethodArgumentTypeMismatch_ReturnsBadRequestWithoutLeakingInput() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler(mock(Environment.class));
        MethodArgumentTypeMismatchException exception = new MethodArgumentTypeMismatchException(
                "not-a-number", Integer.class, "limit", null, new NumberFormatException("bad"));

        ApiError error = handler.handleMethodArgumentTypeMismatch(exception);

        assertEquals(400, error.status());
        assertEquals("must have a valid value", error.errors().get("limit"));
    }

    @Test
    void handleMethodArgumentNotValid_CollectsFieldErrors() {
        Environment env = mock(Environment.class);
        GlobalExceptionHandler handler = new GlobalExceptionHandler(env);

        MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
        org.springframework.validation.BindingResult bindingResult = mock(org.springframework.validation.BindingResult.class);
        when(exception.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(
                new FieldError("dto", "name", "must not be blank"),
                new FieldError("dto", "code", "must not be blank")));

        ApiError error = handler.handleMethodArgumentNotValid(exception);

        assertEquals(400, error.status());
        assertEquals("Bad request", error.message());
        assertEquals("must not be blank", error.errors().get("name"));
        assertEquals("must not be blank", error.errors().get("code"));
        assertNotNull(error.timestamp());
    }

    @Test
    void handleBindException_CollectsFieldErrors() {
        Environment env = mock(Environment.class);
        GlobalExceptionHandler handler = new GlobalExceptionHandler(env);

        BindException exception = new BindException(new Object(), "dto");
        exception.addError(new FieldError("dto", "page", "must be positive"));

        ApiError error = handler.handleBindException(exception);

        assertEquals(400, error.status());
        assertEquals("Bad request", error.message());
        assertEquals("must be positive", error.errors().get("page"));
    }

    @Test
    void handleConstraintViolation_CollectsViolations() {
        Environment env = mock(Environment.class);
        GlobalExceptionHandler handler = new GlobalExceptionHandler(env);

        @SuppressWarnings("unchecked")
        ConstraintViolation<Object> violation = mock(ConstraintViolation.class);
        Path path = mock(Path.class);
        when(path.toString()).thenReturn("dto.code");
        when(violation.getPropertyPath()).thenReturn(path);
        when(violation.getMessage()).thenReturn("invalid code");

        ConstraintViolationException exception = new ConstraintViolationException(Set.of(violation));

        ApiError error = handler.handleConstraintViolation(exception);

        assertEquals(400, error.status());
        assertEquals("Bad request", error.message());
        assertEquals("invalid code", error.errors().get("dto.code"));
    }

    @Test
    void handleAuthenticationAndAccessDenied_ReturnsExpectedStatuses() {
        Environment env = mock(Environment.class);
        GlobalExceptionHandler handler = new GlobalExceptionHandler(env);

        ApiError auth = handler.handleAuthentication(new AuthenticationException("x") {
            private static final long serialVersionUID = 1L;
        });
        ApiError denied = handler.handleAccessDenied(new AccessDeniedException("x"));

        assertEquals(401, auth.status());
        assertEquals("Unauthorized", auth.message());
        assertNull(auth.errors());

        assertEquals(403, denied.status());
        assertEquals("Forbidden", denied.message());
        assertNull(denied.errors());
    }

    @Test
    void handleResponseStatusException_UsesReasonOrDefaultPhrase() {
        Environment env = mock(Environment.class);
        GlobalExceptionHandler handler = new GlobalExceptionHandler(env);

        ResponseEntity<ApiError> withReason = handler
                .handleResponseStatusException(new ResponseStatusException(HttpStatus.NOT_FOUND, "missing"));
        ResponseEntity<ApiError> withoutReason = handler
                .handleResponseStatusException(new ResponseStatusException(HttpStatus.BAD_REQUEST));

        assertEquals(404, withReason.getStatusCode().value());
        assertEquals("missing", withReason.getBody().message());

        assertEquals(400, withoutReason.getStatusCode().value());
        assertEquals("Bad Request", withoutReason.getBody().message());
    }

    @Test
    void handleGenericException_DevProfileExposesRootCauseDetails() {
        Environment env = mock(Environment.class);
        when(env.getActiveProfiles()).thenReturn(new String[] { "dev" });
        GlobalExceptionHandler handler = new GlobalExceptionHandler(env);

        IllegalArgumentException root = new IllegalArgumentException("root");
        RuntimeException ex = new RuntimeException("top", root);

        ApiError error = handler.handleGenericException(ex);

        assertEquals(500, error.status());
        assertEquals("Internal server error", error.message());
        assertNotNull(error.errors());
        assertEquals(RuntimeException.class.getName(), error.errors().get("exception"));
        assertEquals("top", error.errors().get("message"));
        assertEquals(IllegalArgumentException.class.getName(), error.errors().get("rootException"));
        assertEquals("root", error.errors().get("rootMessage"));
    }

    @Test
    void handleGenericException_TestProfileWithoutCauseStillExposesErrors() {
        Environment env = mock(Environment.class);
        when(env.getActiveProfiles()).thenReturn(new String[] { "test" });
        GlobalExceptionHandler handler = new GlobalExceptionHandler(env);

        RuntimeException ex = new RuntimeException((String) null);

        ApiError error = handler.handleGenericException(ex);

        assertEquals(500, error.status());
        assertNotNull(error.errors());
        assertEquals("", error.errors().get("message"));
        assertNull(error.errors().get("rootException"));
    }

    @Test
    void handleGenericException_NonDevProfileHidesInternalErrors() {
        Environment env = mock(Environment.class);
        when(env.getActiveProfiles()).thenReturn(new String[] { "prod" });
        GlobalExceptionHandler handler = new GlobalExceptionHandler(env);

        ApiError error = handler.handleGenericException(new RuntimeException("x"));

        assertEquals(500, error.status());
        assertNull(error.errors());
    }
}
