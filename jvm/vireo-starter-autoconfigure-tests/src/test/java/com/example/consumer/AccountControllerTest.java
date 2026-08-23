package com.example.consumer;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vireocode.starter.auth.ChangePasswordRequest;
import com.vireocode.starter.auth.ChangeUsernameRequest;
import com.vireocode.starter.auth.LoginRequest;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
@DisplayName("AccountControllerIntegrationTests")
class AccountControllerTest {

    private static final String API_BASE_URL = "/api/account";
    private static final String AUTH_BASE_URL = "/api/auth";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private MockHttpSession loginAs(String username, String password) throws Exception {
        String payload = objectMapper.writeValueAsString(new LoginRequest(username, password));

        MvcResult loginResult = mockMvc.perform(post(AUTH_BASE_URL + "/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk())
                .andReturn();

        return (MockHttpSession) loginResult.getRequest().getSession(false);
    }

    @Test
    @DisplayName("PUT " + API_BASE_URL + "/username - Changes username and reflects it in /me")
    void changeUsername_ChangesUsernameAndReflectsInMe() throws Exception {
        MockHttpSession session = loginAs("demo", "demo123");

        String payload = objectMapper
                .writeValueAsString(new ChangeUsernameRequest("demo-renamed"));

        mockMvc.perform(put(API_BASE_URL + "/username")
                .session(session)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("demo-renamed"));

        mockMvc.perform(get(AUTH_BASE_URL + "/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("demo-renamed"));
    }

    @Test
    @DisplayName("PUT " + API_BASE_URL + "/username - Returns conflict when the username is already taken")
    void changeUsername_WhenUsernameTaken_ReturnsConflict() throws Exception {
        MockHttpSession session = loginAs("demo", "demo123");

        String payload = objectMapper
                .writeValueAsString(new ChangeUsernameRequest("superadmin"));

        mockMvc.perform(put(API_BASE_URL + "/username")
                .session(session)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Username already exists"));
    }

    @Test
    @DisplayName("PUT " + API_BASE_URL + "/password - Updates the password when the current password is correct")
    void changePassword_WithCorrectCurrentPassword_UpdatesPassword() throws Exception {
        MockHttpSession session = loginAs("demo", "demo123");

        String payload = objectMapper
                .writeValueAsString(new ChangePasswordRequest("demo123", "new-password-123"));

        mockMvc.perform(put(API_BASE_URL + "/password")
                .session(session)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password updated"));

        // The new password authenticates successfully.
        mockMvc.perform(post(AUTH_BASE_URL + "/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginRequest("demo", "new-password-123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("demo"));

        // The old password no longer works.
        mockMvc.perform(post(AUTH_BASE_URL + "/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginRequest("demo", "demo123"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT " + API_BASE_URL + "/password - Returns bad request when the current password is wrong")
    void changePassword_WithWrongCurrentPassword_ReturnsBadRequest() throws Exception {
        MockHttpSession session = loginAs("demo", "demo123");

        String payload = objectMapper
                .writeValueAsString(new ChangePasswordRequest("wrong-password", "new-password-123"));

        mockMvc.perform(put(API_BASE_URL + "/password")
                .session(session)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Current password is incorrect"));
    }
}
