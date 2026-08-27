package com.vireocode.consumer;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(properties = {
        "vireo.starter.offline.max-batch-size=1",
        "vireo.starter.offline.max-hydration-entities=1"
})
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
@DisplayName("OfflineControllerIntegrationTests")
class OfflineControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(username = "demo", roles = "USER")
    void emptyReplayBatchUsesStableWireShape() throws Exception {
        mockMvc.perform(post("/api/offline/sync")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"commands\":[]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accepted").value(0))
                .andExpect(jsonPath("$.failed").value(0))
                .andExpect(jsonPath("$.results").isEmpty());
    }

    @Test
    @WithMockUser(username = "demo", roles = "USER")
    void replayRejectsAnOfflineEndpointWithoutCallingItRecursively() throws Exception {
        mockMvc.perform(post("/api/offline/sync")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"commands":[{
                          "commandId":"11111111-1111-1111-1111-111111111111",
                          "method":"POST",
                          "url":"/api/offline/sync",
                          "body":null,
                          "headers":{}
                        }]}
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accepted").value(0))
                .andExpect(jsonPath("$.failed").value(1))
                .andExpect(jsonPath("$.results[0].status").value(400))
                .andExpect(jsonPath("$.results[0].reason").value("REJECTED"));
    }

    @Test
    @WithMockUser(username = "demo", roles = "USER")
    void replayAndHydrationLimitsFailAtTheHttpBoundary() throws Exception {
        mockMvc.perform(post("/api/offline/sync")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"commands":[
                          {"commandId":"11111111-1111-1111-1111-111111111111","method":"POST","url":"/api/orders","body":null,"headers":{}},
                          {"commandId":"22222222-2222-2222-2222-222222222222","method":"POST","url":"/api/orders","body":null,"headers":{}}
                        ]}
                        """))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/offline/hydration/versions")
                .queryParam("entities", "ORDER", "CUSTOMER"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "demo", roles = "USER")
    void heartbeatAndHydrationExposeStableJson() throws Exception {
        mockMvc.perform(get("/api/offline/heartbeat"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serverTime").isString())
                .andExpect(jsonPath("$.syncInProgress").value(false));

        mockMvc.perform(get("/api/offline/hydration/versions").queryParam("entities", "ORDER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.serverTime").isString())
                .andExpect(jsonPath("$.versions[0].entity").value("ORDER"))
                .andExpect(jsonPath("$.versions[0].revision").value(0))
                .andExpect(jsonPath("$.versions[0].changedAt").doesNotExist());
    }

    @Test
    void allOfflineEndpointsRejectAnonymousCallers() throws Exception {
        mockMvc.perform(post("/api/offline/sync")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"commands\":[]}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/offline/heartbeat"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/offline/hydration/versions"))
                .andExpect(status().isUnauthorized());
    }
}
