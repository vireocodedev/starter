package com.vireocode.starter.flyway;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class StarterFlywayModuleTest {

    @Test
    void derivesAllOwnedLocationsAndTheHistoryTableFromTheValidatedName() {
        StarterFlywayModule module = new StarterFlywayModule("saved_filter", 20);

        assertEquals("classpath:db/vireo/saved_filter", module.commonLocation());
        assertEquals("classpath:db/vireo/saved_filter/vendor/postgresql", module.vendorLocation("postgresql"));
        assertEquals("flyway_schema_history_vireo_saved_filter", module.historyTable());
    }

    @Test
    void rejectsNamesThatCouldEscapeTheOwnedResourceAndTableNamespaces() {
        assertThrows(NullPointerException.class, () -> new StarterFlywayModule(null, 0));
        assertThrows(IllegalArgumentException.class, () -> new StarterFlywayModule("", 0));
        assertThrows(IllegalArgumentException.class, () -> new StarterFlywayModule("Auth", 0));
        assertThrows(IllegalArgumentException.class, () -> new StarterFlywayModule("../auth", 0));
        assertThrows(IllegalArgumentException.class, () -> new StarterFlywayModule("auth", -1));
    }

    @Test
    void rejectsInvalidVendorLocationSegments() {
        StarterFlywayModule module = new StarterFlywayModule("auth", 10);

        assertThrows(NullPointerException.class, () -> module.vendorLocation(null));
        assertThrows(IllegalArgumentException.class, () -> module.vendorLocation("PostgreSQL"));
        assertThrows(IllegalArgumentException.class, () -> module.vendorLocation("../postgresql"));
    }
}
