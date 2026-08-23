package com.vireocode.starter.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.vireocode.starter.flyway.StarterFlywayModule;

class StarterFlywayConfigurationTest {

    @Test
    void ordersModulesDeterministicallyWhenIndependentModulesShareAnOrder() {
        List<StarterFlywayModule> modules = List.of(
                new StarterFlywayModule("queryengine", 20),
                new StarterFlywayModule("auth", 10),
                new StarterFlywayModule("history", 20));

        assertEquals(List.of("auth", "history", "queryengine"),
                StarterCoreAutoConfiguration.StarterFlywayConfiguration.sortedFlywayModules(modules)
                        .stream()
                        .map(StarterFlywayModule::name)
                        .toList());
    }

    @Test
    void rejectsTwoModulesClaimingTheSameMigrationNamespace() {
        List<StarterFlywayModule> modules = List.of(
                new StarterFlywayModule("auth", 10),
                new StarterFlywayModule("auth", 20));

        assertThrows(IllegalStateException.class,
                () -> StarterCoreAutoConfiguration.StarterFlywayConfiguration.sortedFlywayModules(modules));
    }
}
