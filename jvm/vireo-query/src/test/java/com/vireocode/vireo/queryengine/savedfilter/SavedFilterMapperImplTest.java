package com.vireocode.vireo.queryengine.savedfilter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.vireocode.vireo.auth.StarterUser;

class SavedFilterMapperImplTest {

    private final SavedFilterMapperImpl mapper = new SavedFilterMapperImpl();

    @Test
    void toDomain_WithNullDto_ReturnsNull() {
        assertNull(mapper.toDomain(null));
    }

    @Test
    void toDto_WithNullDomain_ReturnsNull() {
        assertNull(mapper.toDto(null));
    }

    @Test
    void update_WithNullUpdate_DoesNotChangeDestination() {
        SavedFilter destination = savedFilter("Original", "ITEM", "v1", "{}", true, true);

        mapper.update(null, destination);

        assertEquals("Original", destination.getName());
        assertEquals("ITEM", destination.getEntityName());
        assertEquals("v1", destination.getEngineVersion());
        assertEquals("{}", destination.getFiltersJson());
        assertEquals(true, destination.isPublic());
        assertEquals(true, destination.isDefault());
    }

    @Test
    void toDto_WithNullUser_LeavesUserConvenienceFieldsNull() {
        SavedFilter domain = savedFilter("Filter", "ITEM", "v2", "{json}", false, true);
        domain.setUser(null);

        SavedFilterDTO dto = mapper.toDto(domain);

        assertEquals("Filter", dto.getName());
        assertNull(dto.getUserId());
        assertNull(dto.getUsername());
    }

    @Test
    void toDto_WithUser_MapsUserConvenienceFields() {
        StarterUser user = new StarterUser(UUID.randomUUID(), "demo", "hash", "USER", true);
        SavedFilter domain = savedFilter("Filter", "ITEM", "v3", "{x}", true, false);
        domain.setUser(user);

        SavedFilterDTO dto = mapper.toDto(domain);

        assertEquals(user.getId(), dto.getUserId());
        assertEquals("demo", dto.getUsername());
        assertEquals("ITEM", dto.getEntityName());
    }

    @Test
    void update_WithValues_OverridesMappedFields() {
        SavedFilter destination = savedFilter("Old", "ITEM", "v1", "{}", false, false);
        SavedFilterDTO update = new SavedFilterDTO(
                999L,
                "New",
                "desc",
                "SAVED_FILTER",
                "v2",
                "{updated}",
                true,
                true,
                UUID.randomUUID(),
                "ignored");

        mapper.update(update, destination);

        assertEquals("New", destination.getName());
        assertEquals("desc", destination.getDescription());
        assertEquals("SAVED_FILTER", destination.getEntityName());
        assertEquals("v2", destination.getEngineVersion());
        assertEquals("{updated}", destination.getFiltersJson());
        assertEquals(true, destination.isPublic());
        assertEquals(true, destination.isDefault());
    }

    private SavedFilter savedFilter(String name, String entity, String version, String json, boolean isPublic,
            boolean isDefault) {
        SavedFilter savedFilter = new SavedFilter();
        savedFilter.setName(name);
        savedFilter.setDescription("desc");
        savedFilter.setEntityName(entity);
        savedFilter.setEngineVersion(version);
        savedFilter.setFiltersJson(json);
        savedFilter.setPublic(isPublic);
        savedFilter.setDefault(isDefault);
        return savedFilter;
    }
}
