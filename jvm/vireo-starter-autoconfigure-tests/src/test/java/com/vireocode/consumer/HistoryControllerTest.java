package com.vireocode.consumer;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;

import com.vireocode.vireo.base.HistoryEntityType;
import com.vireocode.vireo.history.HistoryReadAuthorizer;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
@Import(HistoryControllerTest.AllowHistoryReads.class)
@DisplayName("HistoryControllerIntegrationTests")
class HistoryControllerTest {

    private static final String API_BASE_URL = "/api/history";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("GET " + API_BASE_URL
            + " - Returns entries for the requested entity and entityId, mapped to DTO fields")
    @WithMockUser(username = "demo", roles = "USER")
    void find_WithMatchingEntityAndEntityId_ReturnsMappedEntries() throws Exception {
        String entityId = "42";
        UUID entryId = saveEntry(ConsumerHistoryEntityType.ITEM, entityId, Instant.now(),
                "{\"name\":\"Widget\"}", null);
        // Entries for a different entityId must not leak into the result.
        saveEntry(ConsumerHistoryEntityType.ITEM, "999", Instant.now(), "{\"name\":\"Other\"}", null);

        mockMvc.perform(get(API_BASE_URL)
                .with(csrf())
                .queryParam("entity", "ITEM")
                .queryParam("entityId", entityId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(entryId.toString()))
                .andExpect(jsonPath("$[0].actor.id").doesNotExist())
                .andExpect(jsonPath("$[0].actor.label").value("demo"))
                .andExpect(jsonPath("$[0].entity").value("ITEM"))
                .andExpect(jsonPath("$[0].entityId").value(entityId))
                .andExpect(jsonPath("$[0].snapshotPrevious.name").value("Widget"))
                .andExpect(jsonPath("$[0].snapshotCurrent").doesNotExist());
    }

    @Test
    @DisplayName("GET " + API_BASE_URL + " - Orders entries chronologically ascending (oldest first)")
    @WithMockUser(username = "demo", roles = "USER")
    void find_WithMultipleEntries_OrdersChronologicallyAscending() throws Exception {
        String entityId = "7";
        Instant now = Instant.now();
        UUID newest = saveEntry(ConsumerHistoryEntityType.ITEM, entityId, now, null, "{\"v\":3}");
        UUID oldest = saveEntry(ConsumerHistoryEntityType.ITEM, entityId, now.minus(2, ChronoUnit.HOURS), null,
                "{\"v\":1}");
        UUID middle = saveEntry(ConsumerHistoryEntityType.ITEM, entityId, now.minus(1, ChronoUnit.HOURS), null,
                "{\"v\":2}");

        mockMvc.perform(get(API_BASE_URL)
                .with(csrf())
                .queryParam("entity", "ITEM")
                .queryParam("entityId", entityId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].id").value(oldest.toString()))
                .andExpect(jsonPath("$[1].id").value(middle.toString()))
                .andExpect(jsonPath("$[2].id").value(newest.toString()));
    }

    @Test
    @DisplayName("GET " + API_BASE_URL + " - limit bounds the result to the most recent entries, still ascending")
    @WithMockUser(username = "demo", roles = "USER")
    void find_WithLimitLowerThanTotal_ReturnsOnlyMostRecentEntriesAscending() throws Exception {
        String entityId = "99";
        Instant now = Instant.now();
        saveEntry(ConsumerHistoryEntityType.ITEM, entityId, now.minus(3, ChronoUnit.HOURS), null, "{\"v\":1}");
        UUID secondNewest = saveEntry(ConsumerHistoryEntityType.ITEM, entityId, now.minus(2, ChronoUnit.HOURS),
                null, "{\"v\":2}");
        UUID mostRecent = saveEntry(ConsumerHistoryEntityType.ITEM, entityId, now.minus(1, ChronoUnit.HOURS), null,
                "{\"v\":3}");

        mockMvc.perform(get(API_BASE_URL)
                .with(csrf())
                .queryParam("entity", "ITEM")
                .queryParam("entityId", entityId)
                .queryParam("limit", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(secondNewest.toString()))
                .andExpect(jsonPath("$[1].id").value(mostRecent.toString()));
    }

    @Test
    @DisplayName("GET " + API_BASE_URL + " - Returns bad request for a non-numeric limit")
    @WithMockUser(username = "demo", roles = "USER")
    void find_WithNonNumericLimit_ReturnsBadRequest() throws Exception {
        mockMvc.perform(get(API_BASE_URL)
                .with(csrf())
                .queryParam("entity", "ITEM")
                .queryParam("entityId", "1")
                .queryParam("limit", "not-a-number"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET " + API_BASE_URL + " - Returns bad request for a zero or negative limit")
    @WithMockUser(username = "demo", roles = "USER")
    void find_WithNonPositiveLimit_ReturnsBadRequest() throws Exception {
        mockMvc.perform(get(API_BASE_URL)
                .with(csrf())
                .queryParam("entity", "ITEM")
                .queryParam("entityId", "1")
                .queryParam("limit", "0"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET " + API_BASE_URL + " - Rejects blank entity identity")
    @WithMockUser(username = "demo", roles = "USER")
    void find_WithBlankEntity_ReturnsBadRequest() throws Exception {
        mockMvc.perform(get(API_BASE_URL)
                .with(csrf())
                .queryParam("entity", " ")
                .queryParam("entityId", "1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET " + API_BASE_URL + " - Fails explicitly for a corrupt persisted snapshot")
    @WithMockUser(username = "demo", roles = "USER")
    void find_WithCorruptSnapshot_ReturnsInternalServerError() throws Exception {
        saveEntry(ConsumerHistoryEntityType.ITEM, "corrupt", Instant.now(), "not-json", null);

        mockMvc.perform(get(API_BASE_URL)
                .with(csrf())
                .queryParam("entity", "ITEM")
                .queryParam("entityId", "corrupt"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Internal server error"));
    }

    @Test
    @DisplayName("GET " + API_BASE_URL + " - Returns unauthorized without authentication")
    void find_WithoutAuthentication_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get(API_BASE_URL)
                .queryParam("entity", "ITEM")
                .queryParam("entityId", "1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET " + API_BASE_URL
            + " - Allows any authenticated role, including one the starter has never heard of")
    @WithMockUser(username = "auditor", roles = "AUDITOR")
    void find_WithRoleUnknownToTheStarter_ReturnsOk() throws Exception {
        mockMvc.perform(get(API_BASE_URL)
                .with(csrf())
                .queryParam("entity", "ITEM")
                .queryParam("entityId", "1"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET " + API_BASE_URL + " - Allows SUPERADMIN role")
    @WithMockUser(username = "root", roles = "SUPERADMIN")
    void find_WithSuperadminRole_ReturnsOk() throws Exception {
        saveEntry(ConsumerHistoryEntityType.ITEM, "1", Instant.now(), null, "{\"name\":\"Widget\"}");

        mockMvc.perform(get(API_BASE_URL)
                .with(csrf())
                .queryParam("entity", "ITEM")
                .queryParam("entityId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class AllowHistoryReads {

        @Bean("historyReadAuthorizer")
        HistoryReadAuthorizer historyReadAuthorizer() {
            return (authentication, entity, entityId) -> true;
        }
    }

    private UUID saveEntry(HistoryEntityType entity, String entityId, Instant occurredAt,
            String snapshotPrevious, String snapshotCurrent) {
        UUID id = UUID.randomUUID();
        jdbcTemplate.update("INSERT INTO history"
                        + " (id, occurred_at, actor_label, entity, entity_id, snapshot_previous, snapshot_current)"
                        + " VALUES (?, ?, ?, ?, ?, ?, ?)",
                id, occurredAt, "demo", entity.name(), entityId, snapshotPrevious, snapshotCurrent);
        return id;
    }
}
