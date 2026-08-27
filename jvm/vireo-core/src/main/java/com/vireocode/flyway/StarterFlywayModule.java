package com.vireocode.flyway;

import java.util.Objects;
import java.util.regex.Pattern;

/**
 * A module's claim on a set of database tables.
 *
 * <p>
 * Library-owned tables need library-owned migrations, and the dangerous way to
 * do that is to drop them into the consumer's {@code db/migration} folder and
 * share one {@code flyway_schema_history}. Version numbers would then be a
 * shared namespace between two independently released codebases: the library
 * ships {@code V2}, the consumer already applied {@code V20260801120000}, and
 * the upgrade is an out-of-order migration against a live database.
 *
 * <p>
 * So each module migrates separately, into its own history table. The library
 * and the consumer can then both number their migrations from one and never
 * meet.
 *
 * <p>
 * Everything is derived from {@link #name()} by convention, because a
 * mis-declared history table would be discovered in production rather than in a
 * build.
 *
 * @param name  short module name, for example {@code auth}
 * @param order relative order across modules. Lower runs first. Only matters
 *              where one module's tables have foreign keys into another's:
 *              {@code history}, {@code saved_filter} and {@code sync_command}
 *              all reference {@code app_user}, so auth migrates first.
 */
public record StarterFlywayModule(String name, int order) {

    private static final Pattern IDENTIFIER = Pattern.compile("[a-z][a-z0-9_]*");

    public StarterFlywayModule {
        Objects.requireNonNull(name, "name must not be null");
        if (!IDENTIFIER.matcher(name).matches()) {
            throw new IllegalArgumentException(
                    "name must be a lowercase SQL-safe identifier starting with a letter: " + name);
        }
        if (order < 0) {
            throw new IllegalArgumentException("order must be greater than or equal to zero");
        }
    }

    /** Migrations every database gets. */
    public String commonLocation() {
        return "classpath:db/vireo/" + name;
    }

    /**
     * Migrations only one database vendor gets, mirroring the
     * {@code classpath:db/vendor/{vendor}} convention consumers already use.
     * Absent directories are not an error.
     */
    public String vendorLocation(String vendor) {
        Objects.requireNonNull(vendor, "vendor must not be null");
        if (!IDENTIFIER.matcher(vendor).matches()) {
            throw new IllegalArgumentException(
                    "vendor must be a lowercase location-safe identifier starting with a letter: " + vendor);
        }
        return "classpath:db/vireo/" + name + "/vendor/" + vendor;
    }

    /** Never {@code flyway_schema_history}. That one belongs to the consumer. */
    public String historyTable() {
        return "flyway_schema_history_vireo_" + name;
    }
}
