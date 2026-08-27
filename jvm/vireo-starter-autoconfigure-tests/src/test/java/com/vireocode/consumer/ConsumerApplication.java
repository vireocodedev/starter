package com.vireocode.consumer;

import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * A deliberately separate application under the publisher's own namespace.
 *
 * <p>
 * The package matters more than anything in the class. Before the JVM split,
 * the starter's beans were found only because they sat below the application's
 * own package, and nothing anywhere declared a scan. {@code com.vireocode.consumer}
 * is a sibling of the library's {@code com.vireocode.vireo} package rather than
 * its child. Every library bean these tests find must therefore arrive through
 * auto-configuration, while the library scan must not discover consumer-owned
 * repositories a second time.
 */
@SpringBootApplication
public class ConsumerApplication {
}
