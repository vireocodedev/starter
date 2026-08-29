package com.vireocode.consumer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.ApplicationContext;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class HistoryEndpointMissingPolicyTest {

    @Autowired
    private ApplicationContext context;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void endpointIsAbsentButRecordingRemainsAvailableWithoutApplicationPolicy() {
        assertThat(context.containsBean("starterHistoryController")).isFalse();
        assertThat(context.containsBean("starterHistoryRecorder")).isTrue();
    }

    @Test
    @WithMockUser(username = "demo", roles = "USER")
    void missingEndpointReturnsTheStableNotFoundContract() throws Exception {
        mockMvc.perform(get("/api/history")
                .queryParam("entity", "ITEM")
                .queryParam("entityId", "42"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Not found"))
                .andExpect(jsonPath("$.errors").doesNotExist());
    }
}
