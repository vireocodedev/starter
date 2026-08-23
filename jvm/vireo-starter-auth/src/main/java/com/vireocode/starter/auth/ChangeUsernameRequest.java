package com.vireocode.starter.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** New username accepted by the default account endpoint. */
public record ChangeUsernameRequest(@NotBlank @Size(max = 100) String username) {
}
