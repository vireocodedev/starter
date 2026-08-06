package com.vireocode.starter.flyway;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import javax.sql.DataSource;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.configuration.Configuration;
import org.springframework.boot.jdbc.DatabaseDriver;

/**
 * Runs one module's migrations into that module's own history table.
 */
public final class StarterFlywayMigrations {

    private StarterFlywayMigrations() {
    }

    /**
     * Resolved from a live connection rather than from
     * {@code spring.datasource.url}, so it stays correct when the URL comes from
     * a connection pool, a test container or a cloud binding.
     */
    public static String resolveVendor(DataSource dataSource) {
        try (Connection connection = dataSource.getConnection()) {
            return DatabaseDriver.fromJdbcUrl(connection.getMetaData().getURL()).getId();
        } catch (SQLException ex) {
            throw new IllegalStateException("Could not determine the database vendor for starter migrations", ex);
        }
    }

    /**
     * @param additionalLocations extra migration locations to merge in. Empty in
     *                            production; the upgrade tests use it to stand in
     *                            for a later release of the library, so that they
     *                            exercise this method rather than a hand-written
     *                            copy of its configuration.
     */
    public static void migrate(StarterFlywayModule module, DataSource dataSource, String vendor,
            String... additionalLocations) {

        List<String> locations = new ArrayList<>();
        locations.add(module.commonLocation());
        locations.add(module.vendorLocation(vendor));
        locations.addAll(List.of(additionalLocations));

        Flyway.configure()
                .dataSource(dataSource)
                .locations(locations.toArray(String[]::new))
                .table(module.historyTable())
                // A module that ships no vendor-specific migrations still names a
                // vendor location. That absence is normal, not a failure.
                .failOnMissingLocations(false)
                // An upgrading consumer already has tables, and this module's
                // history table does not exist yet; Flyway refuses to migrate a
                // non-empty schema without a baseline. Every module after the first
                // sees a non-empty schema even on a brand new database, so this is
                // the common path rather than the exceptional one.
                //
                // Baselining at zero rather than at Flyway's default of one is what
                // keeps each module's own V1 in scope instead of silently skipped.
                .baselineOnMigrate(true)
                .baselineVersion("0")
                .load()
                .migrate();
    }

    /**
     * Gives the consumer's Flyway a history table before the library fills the
     * schema underneath it.
     *
     * <p>
     * Running library migrations first leaves a brand new database non-empty by
     * the time the consumer's Flyway starts, and Flyway refuses a non-empty
     * schema it has no history for. That is a problem the library creates, so
     * the library fixes it rather than asking every consumer to set
     * {@code spring.flyway.baseline-on-migrate}.
     *
     * <p>
     * Only ever acts when the consumer has no history table at all, so it can
     * never paper over that error on a database the consumer really does manage
     * elsewhere. Baselining at zero leaves the consumer's own V1 pending.
     */
    public static void prepareConsumerHistory(Configuration consumerConfiguration) {
        if (!historyTableExists(consumerConfiguration)) {
            Flyway.configure()
                    .configuration(consumerConfiguration)
                    .baselineVersion("0")
                    .load()
                    .baseline();
        }
    }

    private static boolean historyTableExists(Configuration configuration) {
        String table = configuration.getTable();

        try (Connection connection = configuration.getDataSource().getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();

            // Unquoted identifiers fold to upper case on H2 and to lower case on
            // PostgreSQL, and getTables matches on the stored form.
            for (String candidate : List.of(table, table.toUpperCase(Locale.ROOT), table.toLowerCase(Locale.ROOT))) {
                try (ResultSet tables = metaData.getTables(connection.getCatalog(), null, candidate, null)) {
                    if (tables.next()) {
                        return true;
                    }
                }
            }
            return false;
        } catch (SQLException ex) {
            throw new IllegalStateException("Could not inspect the consumer's Flyway history table", ex);
        }
    }
}
