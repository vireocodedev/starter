package com.vireocode.starter.web;

import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

public final class RestUtils {
    private RestUtils() {
    }
    public static ResponseStatusException notFound(String param, String value) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Entity with " + param + "=" + value + " not found");
    }

    public static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    public static ResponseStatusException forbidden(String message) {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, message);
    }

    public static ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    public static ResponseStatusException unauthorized(String message) {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, message);
    }

    public static ResponseStatusException internalServerError(String message) {
        return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, message);
    }

    public static ResponseStatusException notImplemented(String message) {
        return new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, message);
    }

    public static SearchablePageable makePageable(int page, int rowsPerPage, String sortBy, String sortDirection,
            String searchText) {
        Sort sort = "desc".equals(sortDirection) ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, rowsPerPage < 0 ? Integer.MAX_VALUE : rowsPerPage, sort);
        return new SearchablePageable(pageable, searchText);
    }

    public static <T> Optional<T> getCurrentPrincipal(Class<T> principalType) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        if (!principalType.isInstance(principal)) {
            return Optional.empty();
        }

        return Optional.of(principalType.cast(principal));
    }

}
