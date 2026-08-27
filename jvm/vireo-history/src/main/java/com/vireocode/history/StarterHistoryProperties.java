package com.vireocode.history;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/** Configuration for the default History HTTP read endpoint. */
@ConfigurationProperties("vireo.starter.history")
@Validated
public class StarterHistoryProperties {

    /** Whether the default History controller is enabled. */
    private boolean endpointEnabled = true;

    /** Path at which the default History controller is published. */
    @NotBlank
    private String endpointPath = "/api/history";

    /** Number of recent records returned when no limit is requested. */
    @Min(1)
    @Max(10_000)
    private int defaultLimit = 200;

    /** Maximum number of recent records accepted from a caller. */
    @Min(1)
    @Max(10_000)
    private int maxLimit = 500;

    public boolean isEndpointEnabled() {
        return endpointEnabled;
    }

    public void setEndpointEnabled(boolean endpointEnabled) {
        this.endpointEnabled = endpointEnabled;
    }

    public String getEndpointPath() {
        return endpointPath;
    }

    public void setEndpointPath(String endpointPath) {
        this.endpointPath = endpointPath;
    }

    public int getDefaultLimit() {
        return defaultLimit;
    }

    public void setDefaultLimit(int defaultLimit) {
        this.defaultLimit = defaultLimit;
    }

    public int getMaxLimit() {
        return maxLimit;
    }

    public void setMaxLimit(int maxLimit) {
        this.maxLimit = maxLimit;
    }

    /** Ensures the omitted-limit behavior never exceeds the public ceiling. */
    @AssertTrue(message = "default-limit must not exceed max-limit")
    public boolean isDefaultLimitWithinMaximum() {
        return defaultLimit <= maxLimit;
    }
}
