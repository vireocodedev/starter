package com.example.consumer;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
import com.vireocode.starter.auth.LoginRequest;
import com.vireocode.starter.queryengine.savedfilter.SavedFilterDTO;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
@DisplayName("SavedFilterControllerIntegrationTests")
class SavedFilterControllerTest {

    private static final String AUTH_BASE_URL = "/api/auth";
    private static final String API_BASE_URL = "/api/filters";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/filters - Deserializes boolean field from isPublic and serializes it back")
    void create_DeserializesAndSerializesBooleanAsIsPublic() throws Exception {
        MockHttpSession session = loginAsDemo();

        mockMvc.perform(post(API_BASE_URL)
                .with(csrf())
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "name": "Order filter",
                          "description": "ATest",
                          "entityName": "WIDGET",
                          "engineVersion": "1.0",
                          "filtersJson": "{\\\"entity\\\":\\\"WIDGET\\\",\\\"filters\\\":[]}",
                          "isPublic": false,
                          "isDefault": false,
                          "userId": "00000000-0000-0000-0000-000000000001",
                          "username": "attacker"
                        }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isPublic").value(false))
                .andExpect(jsonPath("$.isDefault").value(false))
                .andExpect(jsonPath("$.username").value("demo"))
                .andExpect(jsonPath("$.public").doesNotExist());
    }

    @Test
    @DisplayName("Saved filters expose public records but keep private records and mutations owner-scoped")
    void savedFilters_EnforceVisibilityAndOwnership() throws Exception {
        MockHttpSession demo = loginAsDemo();
        MockHttpSession otherUser = loginAs("superadmin", "superadmin123");

        long privateId = createFilter(demo, "Private demo filter", false);
        long publicId = createFilter(demo, "Public demo filter", true);

        mockMvc.perform(post(API_BASE_URL + "/search")
                .with(csrf())
                .session(otherUser)
                .queryParam("page", "0")
                .queryParam("rowsPerPage", "20")
                .contentType(MediaType.APPLICATION_JSON)
                .content("null"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == " + publicId + ")]").exists())
                .andExpect(jsonPath("$.content[?(@.id == " + privateId + ")]").doesNotExist());

        String updatePayload = objectMapper.writeValueAsString(new SavedFilterDTO(
                null, "Hijacked", null, "WIDGET", "1.0", "{}", true, false, null, null));
        mockMvc.perform(put(API_BASE_URL + "/" + publicId)
                .with(csrf())
                .session(otherUser)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatePayload))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete(API_BASE_URL + "/" + publicId).with(csrf()).session(otherUser))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/filters/search - Serializes boolean field as isPublic")
    void search_SerializesBooleanAsIsPublic() throws Exception {
        MockHttpSession session = loginAsDemo();

        SavedFilterDTO payload = new SavedFilterDTO(
                null,
                "Order filter",
                "ATest",
                "WIDGET",
                "1.0",
                "{\"entity\":\"WIDGET\",\"filters\":[]}",
                true,
                false,
                null,
                null);

        mockMvc.perform(post(API_BASE_URL)
                .with(csrf())
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        mockMvc.perform(post(API_BASE_URL + "/search")
                .with(csrf())
                .session(session)
                .queryParam("page", "0")
                .queryParam("rowsPerPage", "10")
                .contentType(MediaType.APPLICATION_JSON)
                .content("null"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].isPublic").value(true))
                .andExpect(jsonPath("$.content[0].isDefault").value(false))
                .andExpect(jsonPath("$.content[0].public").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/filters/default - Returns current user's default filter for an entity")
    void findDefaultByEntity_ReturnsCurrentUserDefaultFirst() throws Exception {
        MockHttpSession session = loginAsDemo();

        SavedFilterDTO payload = new SavedFilterDTO(
                null,
                "Default item filter",
                "ATest",
                "WIDGET",
                "1.0",
                "{\"entity\":\"WIDGET\",\"rows\":[]}",
                true,
                true,
                null,
                null);

        mockMvc.perform(post(API_BASE_URL)
                .with(csrf())
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        mockMvc.perform(get(API_BASE_URL + "/default")
                .session(session)
                .queryParam("entityName", "WIDGET"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.entityName").value("WIDGET"))
                .andExpect(jsonPath("$.isDefault").value(true))
                .andExpect(jsonPath("$.name").value("Default item filter"));
    }

    private MockHttpSession loginAsDemo() throws Exception {
        return loginAs("demo", "demo123");
    }

    private long createFilter(MockHttpSession session, String name, boolean isPublic) throws Exception {
        SavedFilterDTO payload = new SavedFilterDTO(
                null, name, null, "WIDGET", "1.0", "{}", isPublic, false, null, null);
        MvcResult result = mockMvc.perform(post(API_BASE_URL)
                .with(csrf())
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private MockHttpSession loginAs(String username, String password) throws Exception {
        String loginPayload = objectMapper.writeValueAsString(new LoginRequest(username, password));

        MvcResult loginResult = mockMvc.perform(post(AUTH_BASE_URL + "/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginPayload))
                .andExpect(status().isOk())
                .andReturn();

        return (MockHttpSession) loginResult.getRequest().getSession(false);
    }
}
