package com.example.consumer;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.vireocode.starter.base.HistoryEntityType;
import com.vireocode.starter.history.HistoryEntry;
import com.vireocode.starter.history.HistoryRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
@DisplayName("HistoryControllerIntegrationTests")
class HistoryControllerTest {

    private static final String API_BASE_URL = "/api/history";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private HistoryRepository historyRepository;

    @Test
    @DisplayName("GET " + API_BASE_URL
            + " - Returns entries for the requested entity and entityId, mapped to DTO fields")
    @WithMockUser(username = "demo", roles = "USER")
    void find_WithMatchingEntityAndEntityId_ReturnsMappedEntries() throws Exception {
        String entityId = "42";
        HistoryEntry entry = saveEntry(ConsumerHistoryEntityType.ITEM, entityId, Instant.now(),
                "{\"name\":\"Widget\"}", null);
        // Entries for a different entityId must not leak into the result.
        saveEntry(ConsumerHistoryEntityType.ITEM, "999", Instant.now(), "{\"name\":\"Other\"}", null);

        mockMvc.perform(get(API_BASE_URL)
                .with(csrf())
                .queryParam("entity", "ITEM")
                .queryParam("entityId", entityId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(entry.getId().toString()))
                .andExpect(jsonPath("$[0].actor.id").doesNotExist())
                .andExpect(jsonPath("$[0].actor.label").value(entry.getActorLabel()))
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
        HistoryEntry newest = saveEntry(ConsumerHistoryEntityType.ITEM, entityId, now, null, "{\"v\":3}");
        HistoryEntry oldest = saveEntry(ConsumerHistoryEntityType.ITEM, entityId, now.minus(2, ChronoUnit.HOURS), null,
                "{\"v\":1}");
        HistoryEntry middle = saveEntry(ConsumerHistoryEntityType.ITEM, entityId, now.minus(1, ChronoUnit.HOURS), null,
                "{\"v\":2}");

        mockMvc.perform(get(API_BASE_URL)
                .with(csrf())
                .queryParam("entity", "ITEM")
                .queryParam("entityId", entityId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].id").value(oldest.getId().toString()))
                .andExpect(jsonPath("$[1].id").value(middle.getId().toString()))
                .andExpect(jsonPath("$[2].id").value(newest.getId().toString()));
    }

    @Test
    @DisplayName("GET " + API_BASE_URL + " - limit bounds the result to the most recent entries, still ascending")
    @WithMockUser(username = "demo", roles = "USER")
    void find_WithLimitLowerThanTotal_ReturnsOnlyMostRecentEntriesAscending() throws Exception {
        String entityId = "99";
        Instant now = Instant.now();
        saveEntry(ConsumerHistoryEntityType.ITEM, entityId, now.minus(3, ChronoUnit.HOURS), null, "{\"v\":1}");
        HistoryEntry secondNewest = saveEntry(ConsumerHistoryEntityType.ITEM, entityId, now.minus(2, ChronoUnit.HOURS),
                null, "{\"v\":2}");
        HistoryEntry mostRecent = saveEntry(ConsumerHistoryEntityType.ITEM, entityId, now.minus(1, ChronoUnit.HOURS), null,
                "{\"v\":3}");

        mockMvc.perform(get(API_BASE_URL)
                .with(csrf())
                .queryParam("entity", "ITEM")
                .queryParam("entityId", entityId)
                .queryParam("limit", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(secondNewest.getId().toString()))
                .andExpect(jsonPath("$[1].id").value(mostRecent.getId().toString()));
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

    private HistoryEntry saveEntry(HistoryEntityType entity, String entityId, Instant occurredAt,
            String snapshotPrevious, String snapshotCurrent) {
        HistoryEntry entry = new HistoryEntry();
        entry.setOccurredAt(occurredAt);
        entry.setActorLabel("demo");
        entry.setEntity(entity.name());
        entry.setEntityId(entityId);
        entry.setSnapshotPrevious(snapshotPrevious);
        entry.setSnapshotCurrent(snapshotCurrent);
        return historyRepository.saveAndFlush(entry);
    }
}
