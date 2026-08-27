package com.vireocode.vireo.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CredentialRequestTest {

    @Test
    void loginRequestNeverPrintsThePassword() {
        LoginRequest request = new LoginRequest("demo", "top-secret");

        assertThat(request.toString())
                .contains("demo", "<redacted>")
                .doesNotContain("top-secret");
    }

    @Test
    void passwordChangeRequestNeverPrintsEitherPassword() {
        ChangePasswordRequest request = new ChangePasswordRequest("old-secret", "new-secret");

        assertThat(request.toString())
                .contains("<redacted>")
                .doesNotContain("old-secret", "new-secret");
    }
}
