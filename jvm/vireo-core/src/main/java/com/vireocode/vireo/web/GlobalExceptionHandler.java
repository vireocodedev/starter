package com.vireocode.vireo.web;

import java.time.Clock;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import com.vireocode.vireo.config.StarterCoreProperties;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;

/** Produces the shared {@link ApiError} wire contract for common HTTP failures. */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private final StarterCoreProperties properties;
    private final Clock clock;

    public GlobalExceptionHandler(StarterCoreProperties properties, Clock clock) {
        this.properties = Objects.requireNonNull(properties, "properties must not be null");
        this.clock = Objects.requireNonNull(clock, "clock must not be null");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ApiError handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.merge(error.getField(), safeMessage(error.getDefaultMessage()), this::mergeMessages));
        return badRequest(fieldErrors);
    }

    @ExceptionHandler(BindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ApiError handleBindException(BindException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.merge(error.getField(), safeMessage(error.getDefaultMessage()), this::mergeMessages));
        return badRequest(fieldErrors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ApiError handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> violations = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(violation -> violations.merge(
                violation.getPropertyPath().toString(), safeMessage(violation.getMessage()), this::mergeMessages));
        return badRequest(violations);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ApiError handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        return badRequest(Map.of("request", "Request body is malformed or has an invalid value"));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ApiError handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return badRequest(Map.of(ex.getName(), "must have a valid value"));
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ApiError handleHandlerMethodValidation(HandlerMethodValidationException ex) {
        return badRequest(Map.of("request", "Request parameters are invalid"));
    }

    @ExceptionHandler(AuthenticationException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    ApiError handleAuthentication(AuthenticationException ex) {
        return error(HttpStatus.UNAUTHORIZED, "Unauthorized", null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    ApiError handleAccessDenied(AccessDeniedException ex) {
        return error(HttpStatus.FORBIDDEN, "Forbidden", null);
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiError> handleResponseStatusException(ResponseStatusException ex) {
        HttpStatusCode status = ex.getStatusCode();
        HttpStatus knownStatus = HttpStatus.resolve(status.value());
        String message = ex.getReason() != null
                ? ex.getReason()
                : knownStatus != null ? knownStatus.getReasonPhrase() : "Request failed";
        return ResponseEntity.status(status).body(new ApiError(status.value(), message, null, now()));
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    ApiError handleGenericException(Exception ex) {
        log.error("Unhandled request failure", ex);
        Map<String, String> details = properties.isExposeInternalErrorDetails() ? buildInternalErrors(ex) : null;
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error", details);
    }

    private ApiError badRequest(Map<String, String> errors) {
        return error(HttpStatus.BAD_REQUEST, "Bad request", errors);
    }

    private ApiError error(HttpStatus status, String message, Map<String, String> errors) {
        return new ApiError(status.value(), message, errors, now());
    }

    private Instant now() {
        return Instant.now(clock);
    }

    private String safeMessage(String message) {
        return message == null || message.isBlank() ? "is invalid" : message;
    }

    private String mergeMessages(String first, String second) {
        return first.equals(second) ? first : first + "; " + second;
    }

    private Map<String, String> buildInternalErrors(Exception ex) {
        Throwable rootCause = getRootCause(ex);
        Map<String, String> errors = new LinkedHashMap<>();
        errors.put("exception", ex.getClass().getName());
        errors.put("message", ex.getMessage() != null ? ex.getMessage() : "");
        if (rootCause != ex) {
            errors.put("rootException", rootCause.getClass().getName());
            errors.put("rootMessage", rootCause.getMessage() != null ? rootCause.getMessage() : "");
        }
        return errors;
    }

    private Throwable getRootCause(Throwable throwable) {
        Throwable current = throwable;
        while (current.getCause() != null) {
            current = current.getCause();
        }
        return current;
    }
}
