package com.vireocode.consumer;

import javax.sql.DataSource;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

/**
 * The vendor a consumer deploys to. Worth the container start-up because the
 * vendor migration location and the identity, timestamp and index syntax all
 * differ from H2's, so passing there proves nothing about here.
 *
 * <p>
 * Disabled in the ordinary unit suite so a contributor without Docker still
 * gets a usable build. The support workflow opts in explicitly; once enabled,
 * unavailable Docker is a failure rather than a skip.
 */
@EnabledIfSystemProperty(named = "vireo.postgres.enabled", matches = "true")
@Testcontainers
class PostgresLibraryUpgradeTest extends AbstractLibraryUpgradeTest {

    @Container
    private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer(
            System.getProperty("vireo.postgres.image", "postgres:17-alpine"));

    private DataSource dataSource;

    @BeforeEach
    void freshDatabase() {
        dataSource = new DriverManagerDataSource(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());

        // One container for the class, but every test starts from an empty
        // schema, as a first-time deployment would.
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.execute("DROP SCHEMA public CASCADE");
        jdbc.execute("CREATE SCHEMA public");
    }

    @Override
    protected DataSource dataSource() {
        return dataSource;
    }
}
