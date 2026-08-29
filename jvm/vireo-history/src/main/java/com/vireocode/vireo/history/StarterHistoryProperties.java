package com.vireocode.vireo.history;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Configuration for the default History HTTP read endpoint. */
@ConfigurationProperties("vireo.starter.history")
@Validated
public class StarterHistoryProperties {

    /** Whether the default History controller may be enabled when an application read policy exists. */
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

    /** Safe-default retention for newly written History records. */
    @NotNull
    private Duration retention = Duration.ofDays(30);

    /** Hard per-partition storage quota; legal holds cannot make admission unbounded. */
    @Min(1)
    @Max(1_000_000)
    private int maxRecordsPerPartition = 10_000;

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

    public Duration getRetention() {
        return retention;
    }

    public void setRetention(Duration retention) {
        this.retention = retention;
    }

    public int getMaxRecordsPerPartition() {
        return maxRecordsPerPartition;
    }

    public void setMaxRecordsPerPartition(int maxRecordsPerPartition) {
        this.maxRecordsPerPartition = maxRecordsPerPartition;
    }

    /** Ensures the omitted-limit behavior never exceeds the public ceiling. */
    @AssertTrue(message = "default-limit must not exceed max-limit")
    public boolean isDefaultLimitWithinMaximum() {
        return defaultLimit <= maxLimit;
    }

    @AssertTrue(message = "retention must be positive")
    public boolean isRetentionValid() {
        return retention != null && !retention.isZero() && !retention.isNegative();
    }
}
