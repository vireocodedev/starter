package com.vireocode.offline;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/** Configuration for offline replay, hydration, and heartbeat transport. */
@ConfigurationProperties("vireo.starter.offline")
@Validated
public class StarterOfflineProperties {

    private boolean syncEndpointEnabled = true;
    private boolean heartbeatEndpointEnabled = true;
    private boolean hydrationEndpointEnabled = true;

    @NotBlank
    @Pattern(regexp = "/.*", message = "must begin with '/'")
    private String syncEndpointPath = "/api/offline/sync";

    @NotBlank
    @Pattern(regexp = "/.*", message = "must begin with '/'")
    private String heartbeatEndpointPath = "/api/offline/heartbeat";

    @NotBlank
    @Pattern(regexp = "/.*", message = "must begin with '/'")
    private String hydrationEndpointPath = "/api/offline/hydration";

    @Min(1)
    @Max(1_000)
    private int maxBatchSize = 100;

    @Min(1)
    @Max(100)
    private int maxReplayAttempts = 5;

    @Min(1)
    @Max(1_000)
    private int maxHydrationEntities = 100;

    @NotNull
    private Duration heartbeatInterval = Duration.ofSeconds(1);

    @NotBlank
    @Pattern(regexp = "/.*", message = "must begin with '/'")
    private String replayApiPrefix = "/api/";

    private List<@NotBlank String> replayMethods = new ArrayList<>(List.of("POST", "PUT", "PATCH", "DELETE"));
    private List<@NotBlank String> excludedReplayPathPrefixes = new ArrayList<>(
            List.of("/api/auth", "/api/offline/"));
    private List<@NotBlank String> replayHeaders = new ArrayList<>(
            List.of("Content-Type", "Idempotency-Key", "X-Offline-Temp-Id"));

    @NotBlank
    private String privilegedRole = "SUPERADMIN";

    public boolean isSyncEndpointEnabled() {
        return syncEndpointEnabled;
    }

    public void setSyncEndpointEnabled(boolean syncEndpointEnabled) {
        this.syncEndpointEnabled = syncEndpointEnabled;
    }

    public boolean isHeartbeatEndpointEnabled() {
        return heartbeatEndpointEnabled;
    }

    public void setHeartbeatEndpointEnabled(boolean heartbeatEndpointEnabled) {
        this.heartbeatEndpointEnabled = heartbeatEndpointEnabled;
    }

    public boolean isHydrationEndpointEnabled() {
        return hydrationEndpointEnabled;
    }

    public void setHydrationEndpointEnabled(boolean hydrationEndpointEnabled) {
        this.hydrationEndpointEnabled = hydrationEndpointEnabled;
    }

    public String getSyncEndpointPath() {
        return syncEndpointPath;
    }

    public void setSyncEndpointPath(String syncEndpointPath) {
        this.syncEndpointPath = syncEndpointPath;
    }

    public String getHeartbeatEndpointPath() {
        return heartbeatEndpointPath;
    }

    public void setHeartbeatEndpointPath(String heartbeatEndpointPath) {
        this.heartbeatEndpointPath = heartbeatEndpointPath;
    }

    public String getHydrationEndpointPath() {
        return hydrationEndpointPath;
    }

    public void setHydrationEndpointPath(String hydrationEndpointPath) {
        this.hydrationEndpointPath = hydrationEndpointPath;
    }

    public int getMaxBatchSize() {
        return maxBatchSize;
    }

    public void setMaxBatchSize(int maxBatchSize) {
        this.maxBatchSize = maxBatchSize;
    }

    public int getMaxReplayAttempts() {
        return maxReplayAttempts;
    }

    public void setMaxReplayAttempts(int maxReplayAttempts) {
        this.maxReplayAttempts = maxReplayAttempts;
    }

    public int getMaxHydrationEntities() {
        return maxHydrationEntities;
    }

    public void setMaxHydrationEntities(int maxHydrationEntities) {
        this.maxHydrationEntities = maxHydrationEntities;
    }

    public Duration getHeartbeatInterval() {
        return heartbeatInterval;
    }

    public void setHeartbeatInterval(Duration heartbeatInterval) {
        this.heartbeatInterval = heartbeatInterval;
    }

    public String getReplayApiPrefix() {
        return replayApiPrefix;
    }

    public void setReplayApiPrefix(String replayApiPrefix) {
        this.replayApiPrefix = replayApiPrefix;
    }

    public List<String> getReplayMethods() {
        return replayMethods;
    }

    public void setReplayMethods(List<String> replayMethods) {
        this.replayMethods = replayMethods == null ? new ArrayList<>() : new ArrayList<>(replayMethods);
    }

    public List<String> getExcludedReplayPathPrefixes() {
        return excludedReplayPathPrefixes;
    }

    public void setExcludedReplayPathPrefixes(List<String> excludedReplayPathPrefixes) {
        this.excludedReplayPathPrefixes = excludedReplayPathPrefixes == null
                ? new ArrayList<>()
                : new ArrayList<>(excludedReplayPathPrefixes);
    }

    public List<String> getReplayHeaders() {
        return replayHeaders;
    }

    public void setReplayHeaders(List<String> replayHeaders) {
        this.replayHeaders = replayHeaders == null ? new ArrayList<>() : new ArrayList<>(replayHeaders);
    }

    public String getPrivilegedRole() {
        return privilegedRole;
    }

    public void setPrivilegedRole(String privilegedRole) {
        this.privilegedRole = privilegedRole;
    }

    /** Prevents ambiguous controller registration. */
    @AssertTrue(message = "sync, heartbeat, and hydration endpoint paths must be distinct")
    public boolean isEndpointPathsDistinct() {
        return java.util.stream.Stream.of(syncEndpointPath, heartbeatEndpointPath, hydrationEndpointPath)
                .filter(Objects::nonNull)
                .distinct()
                .count() == 3;
    }

    /** Keeps all replay path policy inside the current server. */
    @AssertTrue(message = "replay path prefixes must begin with '/'")
    public boolean isReplayPathPolicyValid() {
        return excludedReplayPathPrefixes != null
                && excludedReplayPathPrefixes.stream().allMatch(path -> path != null && path.startsWith("/"));
    }

    /** HTTP methods are normalized once and may not contain duplicates. */
    @AssertTrue(message = "replay methods must be unique valid mutation methods")
    public boolean isReplayMethodPolicyValid() {
        if (replayMethods == null || replayMethods.isEmpty()) {
            return false;
        }
        List<String> normalized = replayMethods.stream()
                .filter(Objects::nonNull)
                .map(method -> method.toUpperCase(Locale.ROOT))
                .toList();
        return normalized.size() == normalized.stream().distinct().count()
                && normalized.stream().allMatch(List.of("POST", "PUT", "PATCH", "DELETE")::contains);
    }

    /** Scheduled heartbeats must have a meaningful positive cadence. */
    @AssertTrue(message = "heartbeat interval must be positive")
    public boolean isHeartbeatIntervalValid() {
        return heartbeatInterval != null && !heartbeatInterval.isZero() && !heartbeatInterval.isNegative();
    }
}
