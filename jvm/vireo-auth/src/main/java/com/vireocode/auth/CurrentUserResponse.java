package com.vireocode.auth;

/** Minimal identity exposed by the default current-session endpoint. */
public record CurrentUserResponse(String username, String role) {
}
