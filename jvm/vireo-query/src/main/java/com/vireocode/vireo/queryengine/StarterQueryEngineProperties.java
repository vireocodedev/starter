package com.vireocode.vireo.queryengine;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** Configuration for Query Engine metadata, relation-option, and saved-filter endpoints. */
@ConfigurationProperties("vireo.starter.query-engine")
@Validated
public class StarterQueryEngineProperties {

    /** Whether the default metadata and relation-option endpoint is enabled. */
    private boolean endpointEnabled = true;

    /** Whether the default saved-filter endpoint is enabled. */
    private boolean savedFiltersEndpointEnabled = true;

    /** Path at which Query Engine metadata and relation options are published. */
    @NotBlank
    @Pattern(regexp = "/.*", message = "must begin with '/'")
    private String endpointPath = "/api/queryengine";

    /** Path at which current-user saved filters are published. */
    @NotBlank
    @Pattern(regexp = "/.*", message = "must begin with '/'")
    private String savedFiltersEndpointPath = "/api/filters";

    /** Maximum number of relation options returned by one lookup. */
    @Min(1)
    @Max(1_000)
    private int relationOptionsLimit = 20;

    public boolean isEndpointEnabled() {
        return endpointEnabled;
    }

    public void setEndpointEnabled(boolean endpointEnabled) {
        this.endpointEnabled = endpointEnabled;
    }

    public boolean isSavedFiltersEndpointEnabled() {
        return savedFiltersEndpointEnabled;
    }

    public void setSavedFiltersEndpointEnabled(boolean savedFiltersEndpointEnabled) {
        this.savedFiltersEndpointEnabled = savedFiltersEndpointEnabled;
    }

    public String getEndpointPath() {
        return endpointPath;
    }

    public void setEndpointPath(String endpointPath) {
        this.endpointPath = endpointPath;
    }

    public String getSavedFiltersEndpointPath() {
        return savedFiltersEndpointPath;
    }

    public void setSavedFiltersEndpointPath(String savedFiltersEndpointPath) {
        this.savedFiltersEndpointPath = savedFiltersEndpointPath;
    }

    public int getRelationOptionsLimit() {
        return relationOptionsLimit;
    }

    public void setRelationOptionsLimit(int relationOptionsLimit) {
        this.relationOptionsLimit = relationOptionsLimit;
    }

    /** Prevents two controllers from claiming the same request path. */
    @AssertTrue(message = "endpoint-path and saved-filters-endpoint-path must be distinct")
    public boolean isEndpointPathsDistinct() {
        return !java.util.Objects.equals(endpointPath, savedFiltersEndpointPath);
    }
}
