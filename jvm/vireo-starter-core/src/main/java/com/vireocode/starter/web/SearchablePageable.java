package com.vireocode.starter.web;

import java.util.Objects;

import org.springframework.data.domain.Pageable;

/**
 * Wraps a Spring Data Pageable with an optional search text parameter.
 * Allows the service layer to automatically route to search if text is
 * provided,
 * eliminating conditional logic in controllers.
 */
public class SearchablePageable {
    private final Pageable pageable;
    private final String searchText;

    public SearchablePageable(Pageable pageable, String searchText) {
        this.pageable = Objects.requireNonNull(pageable, "pageable must not be null");
        this.searchText = searchText;
    }

    public Pageable getPageable() {
        return pageable;
    }

    public String getSearchText() {
        return searchText;
    }

    public boolean hasSearchText() {
        return searchText != null && !searchText.isBlank();
    }
}
