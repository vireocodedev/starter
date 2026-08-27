package com.vireocode.vireo.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import com.vireocode.vireo.config.StarterCoreProperties;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;

class GlobalExceptionHandlerTest {

    private static final Instant NOW = Instant.parse("2026-08-23T10:15:30Z");

    @Test
    void handleMethodArgumentTypeMismatch_ReturnsBadRequestWithoutLeakingInput() {
        MethodArgumentTypeMismatchException exception = new MethodArgumentTypeMismatchException(
                "not-a-number", Integer.class, "limit", null, new NumberFormatException("bad"));

        ApiError error = handler(false).handleMethodArgumentTypeMismatch(exception);

        assertEquals(400, error.status());
        assertEquals("must have a valid value", error.errors().get("limit"));
        assertEquals(NOW, error.timestamp());
    }

    @Test
    void handleMethodArgumentNotValid_CollectsAllFieldErrorsWithoutOverwritingDuplicates() {
        MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);
        org.springframework.validation.BindingResult bindingResult = mock(org.springframework.validation.BindingResult.class);
        when(exception.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(
                new FieldError("dto", "name", "must not be blank"),
                new FieldError("dto", "name", "must be shorter"),
                new FieldError("dto", "code", null)));

        ApiError error = handler(false).handleMethodArgumentNotValid(exception);

        assertEquals("must not be blank; must be shorter", error.errors().get("name"));
        assertEquals("is invalid", error.errors().get("code"));
    }

    @Test
    void handleBindAndConstraintViolations_CollectsFieldErrors() {
        BindException bindException = new BindException(new Object(), "dto");
        bindException.addError(new FieldError("dto", "page", "must be positive"));
        assertEquals("must be positive", handler(false).handleBindException(bindException).errors().get("page"));

        @SuppressWarnings("unchecked")
        ConstraintViolation<Object> violation = mock(ConstraintViolation.class);
        Path path = mock(Path.class);
        when(path.toString()).thenReturn("dto.code");
        when(violation.getPropertyPath()).thenReturn(path);
        when(violation.getMessage()).thenReturn("invalid code");
        ConstraintViolationException exception = new ConstraintViolationException(Set.of(violation));

        assertEquals("invalid code", handler(false).handleConstraintViolation(exception).errors().get("dto.code"));
    }

    @Test
    void malformedRequestBody_IsClassifiedAsBadRequest() {
        HttpMessageNotReadableException exception = mock(HttpMessageNotReadableException.class);

        ApiError error = handler(false).handleHttpMessageNotReadable(exception);

        assertEquals(400, error.status());
        assertEquals("Request body is malformed or has an invalid value", error.errors().get("request"));
    }

    @Test
    void authenticationAndAccessDenied_ReturnExpectedStatuses() {
        ApiError auth = handler(false).handleAuthentication(new AuthenticationException("x") {
            private static final long serialVersionUID = 1L;
        });
        ApiError denied = handler(false).handleAccessDenied(new AccessDeniedException("x"));

        assertEquals(401, auth.status());
        assertEquals("Unauthorized", auth.message());
        assertNull(auth.errors());
        assertEquals(403, denied.status());
        assertEquals("Forbidden", denied.message());
        assertNull(denied.errors());
    }

    @Test
    void responseStatusException_UsesReasonOrDefaultPhrase() {
        ResponseEntity<ApiError> withReason = handler(false)
                .handleResponseStatusException(new ResponseStatusException(HttpStatus.NOT_FOUND, "missing"));
        ResponseEntity<ApiError> withoutReason = handler(false)
                .handleResponseStatusException(new ResponseStatusException(HttpStatus.BAD_REQUEST));

        assertEquals(404, withReason.getStatusCode().value());
        assertEquals("missing", withReason.getBody().message());
        assertEquals(400, withoutReason.getStatusCode().value());
        assertEquals("Bad Request", withoutReason.getBody().message());
    }

    @Test
    void genericException_ExposesDetailsOnlyWhenExplicitlyEnabled() {
        RuntimeException exception = new RuntimeException("top", new IllegalArgumentException("root"));

        ApiError hidden = handler(false).handleGenericException(exception);
        ApiError exposed = handler(true).handleGenericException(exception);

        assertNull(hidden.errors());
        assertNotNull(exposed.errors());
        assertEquals(RuntimeException.class.getName(), exposed.errors().get("exception"));
        assertEquals("top", exposed.errors().get("message"));
        assertEquals(IllegalArgumentException.class.getName(), exposed.errors().get("rootException"));
        assertEquals("root", exposed.errors().get("rootMessage"));
    }

    private GlobalExceptionHandler handler(boolean exposeInternalDetails) {
        StarterCoreProperties properties = new StarterCoreProperties();
        properties.setExposeInternalErrorDetails(exposeInternalDetails);
        return new GlobalExceptionHandler(properties, Clock.fixed(NOW, ZoneOffset.UTC));
    }
}
