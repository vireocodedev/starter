package com.vireocode.vireo.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Credentials accepted by the default session login endpoint. */
public record LoginRequest(
        @NotBlank @Size(max = 100) String username,
        @NotBlank @Size(max = 4096) String password) {

    /** Never include credentials in logs, debugger summaries, or validation output. */
    @Override
    public String toString() {
        return "LoginRequest[username=" + username + ", password=<redacted>]";
    }
}
