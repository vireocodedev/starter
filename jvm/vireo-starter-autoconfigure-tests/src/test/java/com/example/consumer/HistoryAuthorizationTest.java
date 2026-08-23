package com.example.consumer;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.vireocode.starter.history.HistoryReadAuthorizer;

import org.springframework.beans.factory.annotation.Autowired;

@SpringBootTest
@AutoConfigureMockMvc
@Import(HistoryAuthorizationTest.AuthorizationPolicy.class)
class HistoryAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(username = "demo", roles = "USER")
    void applicationPolicyCanDenyAnAuthenticatedCaller() throws Exception {
        mockMvc.perform(get("/api/history")
                .queryParam("entity", "ITEM")
                .queryParam("entityId", "42"))
                .andExpect(status().isForbidden());
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class AuthorizationPolicy {

        @Bean("historyReadAuthorizer")
        HistoryReadAuthorizer denyHistoryReads() {
            return (authentication, entity, entityId) -> false;
        }
    }
}
