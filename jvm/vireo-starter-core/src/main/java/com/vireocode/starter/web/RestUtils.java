package com.vireocode.starter.web;

import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
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
        if (page < 0) {
            throw badRequest("page must be greater than or equal to zero");
        }
        if (rowsPerPage == 0 || rowsPerPage < -1) {
            throw badRequest("rowsPerPage must be greater than zero or exactly -1");
        }
        if (sortBy == null || sortBy.isBlank()) {
            throw badRequest("sortBy must not be blank");
        }

        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(sortDirection);
        } catch (IllegalArgumentException | NullPointerException exception) {
            throw badRequest("sortDirection must be asc or desc");
        }

        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, rowsPerPage == -1 ? Integer.MAX_VALUE : rowsPerPage, sort);
        return new SearchablePageable(pageable, searchText);
    }

    public static <T> Optional<T> getCurrentPrincipal(Class<T> principalType) {
        if (principalType == null) {
            throw new IllegalArgumentException("principalType must not be null");
        }
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        if (!principalType.isInstance(principal)) {
            return Optional.empty();
        }

        return Optional.of(principalType.cast(principal));
    }

}
