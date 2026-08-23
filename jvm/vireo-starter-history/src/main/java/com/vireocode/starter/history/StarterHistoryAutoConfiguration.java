package com.vireocode.starter.history;

import java.time.Clock;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vireocode.starter.base.HistoryEventsRecorder;
import com.vireocode.starter.flyway.StarterFlywayModule;

/**
 * Wires audit history from the dependency alone.
 *
 * <p>
 * {@code BaseService} records history through core's
 * {@link HistoryEventsRecorder} interface, so a consumer who wants history
 * written somewhere other than the {@code history} table replaces that bean and
 * keeps everything else.
 */
@AutoConfiguration
public class StarterHistoryAutoConfiguration {

    @Bean
    StarterFlywayModule historyFlywayModule() {
        return new StarterFlywayModule("history", 20);
    }

    @Bean
    @ConditionalOnMissingBean(HistoryEventsRecorder.class)
    HistoryRecorder starterHistoryRecorder(HistoryRepository repository, ObjectMapper objectMapper,
            HistoryActorResolver actorResolver, Clock clock) {
        return new HistoryRecorder(repository, objectMapper, actorResolver, clock);
    }

    @Bean
    @ConditionalOnMissingBean
    HistoryActorResolver starterHistoryActorResolver() {
        return new SecurityContextHistoryActorResolver();
    }

    @Bean
    @ConditionalOnMissingBean
    Clock starterHistoryClock() {
        return Clock.systemUTC();
    }

    @Bean
    @ConditionalOnMissingBean
    HistoryController starterHistoryController(HistoryRepository repository, ObjectMapper objectMapper) {
        return new HistoryController(repository, objectMapper);
    }
}
