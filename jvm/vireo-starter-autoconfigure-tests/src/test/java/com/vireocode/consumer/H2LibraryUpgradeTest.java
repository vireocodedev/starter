package com.vireocode.consumer;

import java.util.concurrent.atomic.AtomicInteger;

import javax.sql.DataSource;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

/** The default vendor for local development and for the test suite. */
class H2LibraryUpgradeTest extends AbstractLibraryUpgradeTest {

    private static final AtomicInteger COUNTER = new AtomicInteger();

    private DataSource dataSource;

    @BeforeEach
    void freshDatabase() {
        // A new in-memory database per test, so that each one starts from the
        // state a first-time deployment would actually see.
        dataSource = new DriverManagerDataSource(
                "jdbc:h2:mem:upgrade-" + COUNTER.incrementAndGet() + ";DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
                "sa", "");
    }

    @Override
    protected DataSource dataSource() {
        return dataSource;
    }
}
