package com.example.consumer;

import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.vireocode.starter.queryengine.QueryEntityKey;
import com.vireocode.starter.queryengine.QueryEntityTypeResolver;

/**
 * Registers the consumer's own entity with the query engine.
 *
 * <p>
 * The library ships no keys of its own — {@link QueryEntityKey} is an open
 * extension point — so a saved filter naming an entity the consumer never bound
 * is rejected. This is the whole registration step a consumer performs, and the
 * saved-filter tests lean on it to prove the rejection is real.
 */
@Configuration
public class ConsumerQueryEngineConfig {

    public enum ConsumerQueryEntityKey implements QueryEntityKey {
        WIDGET
    }

    @Bean
    QueryEntityTypeResolver consumerQueryEntityTypeResolver() {
        return () -> Map.of(ConsumerQueryEntityKey.WIDGET, ConsumerWidget.class);
    }
}
