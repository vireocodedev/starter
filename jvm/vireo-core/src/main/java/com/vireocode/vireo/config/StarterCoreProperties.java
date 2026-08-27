package com.vireocode.vireo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

/** Configuration for shared Core web and auditing behavior. */
@ConfigurationProperties("vireo.starter.core")
@Validated
public class StarterCoreProperties {

    /**
     * Whether generic HTTP 500 responses include exception class names and
     * messages. Disabled by default because those details may contain secrets.
     */
    private boolean exposeInternalErrorDetails;

    /** Auditor name used when no authenticated principal exists. */
    @NotBlank
    private String systemAuditor = "system";

    public boolean isExposeInternalErrorDetails() {
        return exposeInternalErrorDetails;
    }

    public void setExposeInternalErrorDetails(boolean exposeInternalErrorDetails) {
        this.exposeInternalErrorDetails = exposeInternalErrorDetails;
    }

    public String getSystemAuditor() {
        return systemAuditor;
    }

    public void setSystemAuditor(String systemAuditor) {
        this.systemAuditor = systemAuditor;
    }
}
