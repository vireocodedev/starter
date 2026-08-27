package com.vireocode.consumer;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Proves that a consumer who declares nothing but the dependencies ends up with
 * the library's tables, in the library's own migration histories, alongside an
 * untouched history of their own.
 */
@SpringBootTest
class ConsumerMigrationTest {

    @Autowired
    private DataSource dataSource;

    private JdbcTemplate jdbc() {
        return new JdbcTemplate(dataSource);
    }

    @Test
    void libraryTablesExist() {
        assertThat(tableNames())
                .contains("APP_USER", "HISTORY", "SAVED_FILTER", "SYNC_COMMAND", "OFFLINE_ENTITY_VERSION");
    }

    @Test
    void consumerTablesExist() {
        assertThat(tableNames()).contains("CONSUMER_WIDGET");
    }

    @Test
    void eachModuleKeepsItsOwnHistory() {
        assertThat(tableNames()).contains(
                "FLYWAY_SCHEMA_HISTORY_VIREO_AUTH",
                "FLYWAY_SCHEMA_HISTORY_VIREO_HISTORY",
                "FLYWAY_SCHEMA_HISTORY_VIREO_QUERYENGINE",
                "FLYWAY_SCHEMA_HISTORY_VIREO_OFFLINE",
                "FLYWAY_SCHEMA_HISTORY");
    }

    /**
     * The failure this whole split exists to prevent: a library migration
     * landing in the consumer's history, where a later library release could
     * renumber it.
     */
    @Test
    void theConsumerHistoryHoldsOnlyTheConsumerOwnMigrations() {
        List<String> descriptions = jdbc().queryForList(
                "SELECT \"description\" FROM \"flyway_schema_history\" WHERE \"type\" = 'SQL'",
                String.class);

        assertThat(descriptions).containsExactly("consumer baseline");
    }

    @Test
    void eachModuleAppliedOnlyItsOwnMigrations() {
        assertThat(appliedIn("auth")).containsExactly("auth baseline");
        assertThat(appliedIn("history")).containsExactly("history baseline", "neutral actor contract");
        assertThat(appliedIn("queryengine")).containsExactly("saved filter baseline");
        assertThat(appliedIn("offline")).containsExactly("offline baseline", "decouple sync actor");
    }

    private List<String> appliedIn(String module) {
        return jdbc().queryForList(
                "SELECT \"description\" FROM \"flyway_schema_history_vireo_" + module
                        + "\" WHERE \"type\" = 'SQL'",
                String.class);
    }

    private List<String> tableNames() {
        return jdbc().queryForList(
                "SELECT UPPER(table_name) FROM information_schema.tables WHERE table_schema = 'PUBLIC'",
                String.class);
    }
}
