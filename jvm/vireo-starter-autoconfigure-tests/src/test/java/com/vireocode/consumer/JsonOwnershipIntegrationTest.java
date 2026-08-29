package com.vireocode.consumer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.ApplicationContext;
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Boot-owned JSON composition")
class JsonOwnershipIntegrationTest {

    @Autowired
    private ApplicationContext context;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RequestMappingHandlerAdapter handlerAdapter;

    @Autowired
    private MockMvc mockMvc;

    @Test
    @SuppressWarnings("removal")
    void bootOwnsTheMapperAndHttpConverter() {
        assertThat(objectMapper).isInstanceOf(JsonMapper.class);
        assertThat(context.getBeansOfType(com.fasterxml.jackson.databind.ObjectMapper.class)).isEmpty();
        assertThat(handlerAdapter.getMessageConverters())
                .anyMatch(JacksonJsonHttpMessageConverter.class::isInstance)
                .noneMatch(MappingJackson2HttpMessageConverter.class::isInstance);
    }

    @Test
    void starterCustomizerComposesWithBootModulesAndGeneratedWireSemantics() throws Exception {
        GeneratedPatch undefined = new GeneratedPatch();
        undefined.setActive(true);

        assertThat(objectMapper.writeValueAsString(undefined)).isEqualTo("{\"isActive\":true}");

        GeneratedPatch explicitNull = new GeneratedPatch();
        explicitNull.setDisplayName(JsonNullable.of(null));
        explicitNull.setActive(false);
        assertThat(objectMapper.writeValueAsString(explicitNull))
                .isEqualTo("{\"displayName\":null,\"isActive\":false}");

        GeneratedPatch decoded = objectMapper.readValue(
                "{\"displayName\":\"Vireo\",\"isActive\":true}", GeneratedPatch.class);
        assertThat(decoded.getDisplayName()).isEqualTo(JsonNullable.of("Vireo"));
        assertThat(decoded.isActive()).isTrue();
    }

    @Test
    @WithMockUser(username = "docs-reader")
    void openApiEndpointIsAJsonObjectRatherThanABase64JsonString() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/json"))
                .andExpect(jsonPath("$.openapi").isString())
                .andExpect(jsonPath("$.paths").isMap());
    }

    static final class GeneratedPatch {

        private JsonNullable<String> displayName = JsonNullable.undefined();
        private boolean active;

        public JsonNullable<String> getDisplayName() {
            return displayName;
        }

        public void setDisplayName(JsonNullable<String> displayName) {
            this.displayName = displayName;
        }

        public boolean isActive() {
            return active;
        }

        public void setActive(boolean active) {
            this.active = active;
        }
    }
}
