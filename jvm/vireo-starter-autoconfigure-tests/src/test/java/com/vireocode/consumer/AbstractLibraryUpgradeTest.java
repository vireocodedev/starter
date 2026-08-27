package com.vireocode.consumer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;

import com.vireocode.vireo.flyway.StarterFlywayMigrations;
import com.vireocode.vireo.flyway.StarterFlywayModule;

/**
 * The proof behind the split: upgrading the library on a database an earlier
 * version created must not disturb the consumer's own migration history.
 *
 * <p>
 * Round one plays the part of the deployed release. Round two adds a location to
 * the auth module only, which is exactly what a version bump looks like from
 * Flyway's point of view — the same V1 it already applied, plus a file it has
 * never seen. Both rounds go through {@link StarterFlywayMigrations}, so the
 * test cannot pass by configuring Flyway more forgivingly than production does.
 *
 * <p>
 * Note that round two is itself a checksum assertion. Flyway validates applied
 * migrations against resolved ones before every migrate, so if the library's V1
 * had landed in the consumer's history, or if a module's history had been shared
 * with another, this call would fail rather than return.
 *
 * <p>
 * Run against every vendor the library supports, because the vendor location and
 * the identity/timestamp syntax differ between them.
 */
abstract class AbstractLibraryUpgradeTest {

    private static final List<StarterFlywayModule> RELEASED_MODULES = List.of(
            new StarterFlywayModule("auth", 10),
            new StarterFlywayModule("history", 20),
            new StarterFlywayModule("queryengine", 20),
            new StarterFlywayModule("offline", 20));

    private static final String NEXT_AUTH_RELEASE = "classpath:db/vireo-next/auth";

    protected abstract DataSource dataSource();

    @Test
    void aLibraryUpgradeLeavesTheConsumerHistoryUntouched() {
        DataSource dataSource = dataSource();

        deploy(dataSource);
        List<Map<String, Object>> consumerHistoryBefore = historyRows(dataSource, "flyway_schema_history");

        upgrade(dataSource);

        assertThat(historyRows(dataSource, "flyway_schema_history"))
                .as("the consumer's history after a library upgrade")
                .isEqualTo(consumerHistoryBefore);
    }

    @Test
    void aLibraryUpgradeAppliesTheNewMigrationToTheOwningModuleOnly() {
        DataSource dataSource = dataSource();

        deploy(dataSource);
        upgrade(dataSource);

        assertThat(appliedVersions(dataSource, "flyway_schema_history_vireo_auth")).containsExactly("1", "2");
        assertThat(appliedVersions(dataSource, "flyway_schema_history_vireo_history")).containsExactly("1", "2");
        assertThat(appliedVersions(dataSource, "flyway_schema_history_vireo_queryengine")).containsExactly("1");
        assertThat(appliedVersions(dataSource, "flyway_schema_history_vireo_offline")).containsExactly("1", "2");
    }

    @Test
    void aLibraryUpgradeChangesTheSchemaItShipped() {
        DataSource dataSource = dataSource();

        deploy(dataSource);
        assertThat(columnNames(dataSource, "app_user")).doesNotContain("LAST_LOGIN_AT");

        upgrade(dataSource);
        assertThat(columnNames(dataSource, "app_user")).contains("LAST_LOGIN_AT");
    }

    /** A second deploy of the same version is a no-op, not an error. */
    @Test
    void redeployingTheSameVersionIsIdempotent() {
        DataSource dataSource = dataSource();

        deploy(dataSource);
        List<Map<String, Object>> before = historyRows(dataSource, "flyway_schema_history_vireo_auth");

        deploy(dataSource);

        assertThat(historyRows(dataSource, "flyway_schema_history_vireo_auth")).isEqualTo(before);
    }

    /**
     * The state an application is in the moment it adopts the library: the
     * tables are already there, created by a migration of its own, but none of
     * the library's histories exist yet. Adoption has to claim them in place
     * rather than try to create them again or wipe them.
     */
    @Test
    void adoptingTheLibraryOnADatabaseThatAlreadyHasItsTablesKeepsTheData() {
        DataSource dataSource = dataSource();
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);

        deploy(dataSource);
        jdbc.update("INSERT INTO app_user (id, username, password_hash, role, enabled, deleted)"
                + " VALUES ('11111111-1111-1111-1111-111111111111', 'kept', 'x', 'USER', TRUE, FALSE)");

        for (StarterFlywayModule module : RELEASED_MODULES) {
            jdbc.execute("DROP TABLE \"" + module.historyTable() + "\"");
        }

        deploy(dataSource);

        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM app_user WHERE username = 'kept'", Integer.class))
                .isEqualTo(1);
        assertThat(appliedVersions(dataSource, "flyway_schema_history_vireo_auth")).containsExactly("1");
    }

    @Test
    void upgradingHistoryFromPublishedV1PreservesActorsAndRemovesTheAuthForeignKey() {
        DataSource dataSource = dataSource();
        String vendor = StarterFlywayMigrations.resolveVendor(dataSource);

        StarterFlywayMigrations.migrate(new StarterFlywayModule("auth", 10), dataSource, vendor);
        Flyway.configure()
                .dataSource(dataSource)
                .table("flyway_schema_history_vireo_history")
                .locations("classpath:db/vireo-previous/history")
                .baselineOnMigrate(true)
                .baselineVersion("0")
                .load()
                .migrate();

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update("INSERT INTO app_user (id, username, password_hash, role, enabled, deleted)"
                + " VALUES ('11111111-1111-1111-1111-111111111111', 'legacy-user', 'x', 'USER', TRUE, FALSE)");
        jdbc.update("INSERT INTO history"
                + " (id, occurred_at, owner_id, owner_username, entity, entity_id, snapshot_current)"
                + " VALUES ('22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP,"
                + " '11111111-1111-1111-1111-111111111111', 'legacy-user', 'ITEM', '42', '{}')");

        StarterFlywayMigrations.migrate(new StarterFlywayModule("history", 20), dataSource, vendor);

        assertThat(appliedVersions(dataSource, "flyway_schema_history_vireo_history")).containsExactly("1", "2");
        assertThat(jdbc.queryForObject(
                "SELECT actor_id FROM history WHERE entity_id = '42'", String.class))
                .isEqualTo("11111111-1111-1111-1111-111111111111");
        assertThat(jdbc.queryForObject(
                "SELECT actor_label FROM history WHERE entity_id = '42'", String.class))
                .isEqualTo("legacy-user");
        assertThat(columnNames(dataSource, "history"))
                .contains("ACTOR_ID", "ACTOR_LABEL")
                .doesNotContain("OWNER_ID", "OWNER_USERNAME");
    }

    @Test
    void upgradingOfflineFromPublishedV1PreservesCommandsAndRemovesTheAuthForeignKey() {
        DataSource dataSource = dataSource();
        String vendor = StarterFlywayMigrations.resolveVendor(dataSource);

        StarterFlywayMigrations.migrate(new StarterFlywayModule("auth", 10), dataSource, vendor);
        Flyway.configure()
                .dataSource(dataSource)
                .table("flyway_schema_history_vireo_offline")
                .locations("classpath:db/vireo/offline")
                .baselineOnMigrate(true)
                .baselineVersion("0")
                .target("1")
                .load()
                .migrate();

        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.update("INSERT INTO app_user (id, username, password_hash, role, enabled, deleted)"
                + " VALUES ('11111111-1111-1111-1111-111111111111', 'legacy-user', 'x', 'USER', TRUE, FALSE)");
        if ("h2".equals(vendor)) {
            // H2 2.4 cannot evaluate V1's persisted IN-list check after Flyway
            // closes its migration session. V2 repairs that production issue;
            // dropping it here only lets this upgrade fixture seed a V1 row.
            jdbc.execute("ALTER TABLE sync_command DROP CONSTRAINT ck_sync_command_status");
        }
        jdbc.update("INSERT INTO sync_command"
                + " (id, command_id, owner_id, owner_username, http_method, url, request_headers,"
                + " request_body, status, created_at)"
                + " VALUES ('22222222-2222-2222-2222-222222222222',"
                + " '33333333-3333-3333-3333-333333333333',"
                + " '11111111-1111-1111-1111-111111111111', 'legacy-user', 'POST', '/api/items',"
                + " '{}', '{}', 'PENDING', CURRENT_TIMESTAMP)");

        StarterFlywayMigrations.migrate(new StarterFlywayModule("offline", 20), dataSource, vendor);

        assertThat(appliedVersions(dataSource, "flyway_schema_history_vireo_offline")).containsExactly("1", "2");
        assertThat(jdbc.queryForObject(
                "SELECT owner_id FROM sync_command WHERE id = '22222222-2222-2222-2222-222222222222'",
                String.class))
                .isEqualTo("11111111-1111-1111-1111-111111111111");

        jdbc.update("DELETE FROM app_user WHERE id = '11111111-1111-1111-1111-111111111111'");

        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM sync_command WHERE id = '22222222-2222-2222-2222-222222222222'",
                Integer.class))
                .isEqualTo(1);

        jdbc.update("INSERT INTO sync_command"
                + " (id, command_id, owner_username, http_method, url, status, created_at)"
                + " VALUES ('44444444-4444-4444-4444-444444444444',"
                + " '55555555-5555-5555-5555-555555555555', 'current-user', 'PATCH', '/api/items/42',"
                + " 'DONE', CURRENT_TIMESTAMP)");
        assertThatThrownBy(() -> jdbc.update("INSERT INTO sync_command"
                + " (id, command_id, owner_username, http_method, url, status, created_at)"
                + " VALUES ('66666666-6666-6666-6666-666666666666',"
                + " '77777777-7777-7777-7777-777777777777', 'current-user', 'PATCH', '/api/items/42',"
                + " 'UNKNOWN', CURRENT_TIMESTAMP)"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private void deploy(DataSource dataSource) {
        migrateAll(dataSource);
    }

    private void upgrade(DataSource dataSource) {
        migrateAll(dataSource, NEXT_AUTH_RELEASE);
    }

    private void migrateAll(DataSource dataSource, String... nextAuthRelease) {
        String vendor = StarterFlywayMigrations.resolveVendor(dataSource);

        Flyway consumerFlyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .load();

        StarterFlywayMigrations.prepareConsumerHistory(consumerFlyway.getConfiguration());

        for (StarterFlywayModule module : RELEASED_MODULES) {
            String[] extras = "auth".equals(module.name()) ? nextAuthRelease : new String[0];
            StarterFlywayMigrations.migrate(module, dataSource, vendor, extras);
        }

        consumerFlyway.migrate();
    }

    private List<Map<String, Object>> historyRows(DataSource dataSource, String table) {
        return new JdbcTemplate(dataSource).queryForList(
                "SELECT \"installed_rank\", \"version\", \"description\", \"checksum\","
                        + " \"installed_on\", \"success\""
                        + " FROM \"" + table + "\" ORDER BY \"installed_rank\"");
    }

    private List<String> appliedVersions(DataSource dataSource, String table) {
        return new JdbcTemplate(dataSource).queryForList(
                "SELECT \"version\" FROM \"" + table
                        + "\" WHERE \"type\" = 'SQL' ORDER BY \"installed_rank\"",
                String.class);
    }

    private List<String> columnNames(DataSource dataSource, String table) {
        return new JdbcTemplate(dataSource).queryForList(
                "SELECT UPPER(column_name) FROM information_schema.columns"
                        + " WHERE UPPER(table_name) = UPPER(?)",
                String.class, table);
    }
}
