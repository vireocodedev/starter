package com.vireocode.vireo.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Current and replacement credentials accepted by the default account endpoint. */
public record ChangePasswordRequest(
        @NotBlank @Size(max = 4096) String currentPassword,
        @NotBlank @Size(max = 4096) String newPassword) {

    /** Never include either credential in logs or debugger summaries. */
    @Override
    public String toString() {
        return "ChangePasswordRequest[currentPassword=<redacted>, newPassword=<redacted>]";
    }
}
