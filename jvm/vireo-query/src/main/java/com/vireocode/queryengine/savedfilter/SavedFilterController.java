package com.vireocode.queryengine.savedfilter;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.vireocode.queryengine.QueryFilterRequest;
import com.vireocode.security.SecurityExpressions;
import com.vireocode.web.RestUtils;
import com.vireocode.web.SearchablePageable;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Validated
@RequestMapping("${vireo.starter.query-engine.saved-filters-endpoint-path:/api/filters}")
@Tag(name = "SavedFilter")
@PreAuthorize(SecurityExpressions.IS_AUTHENTICATED)
public class SavedFilterController {

    private final SavedFilterService service;

    public SavedFilterController(SavedFilterService service) {
        this.service = service;
    }

    @GetMapping("/all")
    public List<SavedFilterDTO> findAll() {
        SearchablePageable pageable = new SearchablePageable(Pageable.unpaged(), null);
        return this.service.findAll(pageable).toList();
    }

    @PostMapping("/search")
    public Page<SavedFilterDTO> search(@RequestParam(defaultValue = "0", name = "page") int page,
            @RequestParam(defaultValue = "10", name = "rowsPerPage") int rowsPerPage,
            @RequestParam(defaultValue = "name", name = "sortBy") String sortBy,
            @RequestParam(defaultValue = "asc", name = "sortDirection") String sortDirection,
            @RequestParam(required = false, name = "searchText") String searchText,
            @RequestBody(required = false) QueryFilterRequest filters) {
        SearchablePageable pageable = RestUtils.makePageable(page, rowsPerPage, normalizeSortBy(sortBy), sortDirection,
                searchText);
        return this.service.findAll(pageable, filters);
    }

    @GetMapping("/default")
    public SavedFilterDTO findDefaultByEntity(@RequestParam(name = "entityName") String entityName) {
        return this.service.findDefaultByEntityName(entityName);
    }

    @PostMapping
    public SavedFilterDTO create(@Valid @RequestBody SavedFilterDTO savedFilterDTO) {
        return this.service.create(savedFilterDTO);
    }

    @PutMapping("/{savedFilterId}")
    public SavedFilterDTO update(@PathVariable Long savedFilterId, @Valid @RequestBody SavedFilterDTO savedFilterDTO) {
        return this.service.update(savedFilterId, savedFilterDTO);
    }

    @DeleteMapping("/{savedFilterId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long savedFilterId) {
        this.service.delete(savedFilterId);
    }

    private String normalizeSortBy(String sortBy) {
        if ("userId".equals(sortBy)) {
            return "user.id";
        }

        if ("username".equals(sortBy)) {
            return "user.username";
        }

        return sortBy;
    }
}
