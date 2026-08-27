package com.vireocode.vireo.auth;

/** Result returned after the default endpoint establishes a session. */
public record LoginResponse(String username, String message) {
}
