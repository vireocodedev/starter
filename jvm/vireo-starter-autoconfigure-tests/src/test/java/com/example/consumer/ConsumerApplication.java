package com.example.consumer;

import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * A deliberately foreign application.
 *
 * <p>
 * The package matters more than anything in the class. Before the JVM split,
 * the starter's beans were found only because they sat below the application's
 * own package, and nothing anywhere declared a scan. {@code com.example.consumer}
 * shares no prefix with {@code com.vireocode.starter}, so every bean these tests
 * find had to arrive through auto-configuration.
 */
@SpringBootApplication
public class ConsumerApplication {
}
