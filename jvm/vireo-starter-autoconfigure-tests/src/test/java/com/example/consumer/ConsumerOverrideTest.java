package com.example.consumer;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

import com.vireocode.starter.base.HistoryEntityType;
import com.vireocode.starter.spi.HistoryEventsRecorder;
import com.vireocode.starter.history.HistoryActor;
import com.vireocode.starter.history.HistoryActorResolver;
import com.vireocode.starter.history.HistoryReadAuthorizer;
import com.vireocode.starter.offline.OfflineActor;
import com.vireocode.starter.offline.OfflineActorResolver;
import com.vireocode.starter.offline.OfflineSyncService;
import com.vireocode.starter.offline.StarterOfflineActorResolver;
import com.vireocode.starter.queryengine.QueryEngineRegistry;

/**
 * A default is only a default if it gets out of the way.
 *
 * <p>
 * This consumer substitutes its own user store, security chain, password
 * encoder, history sink and offline actor resolver. None of that required
 * editing, copying or forking the library: each replacement is one
 * {@code @Bean} method, and the library's version withdraws.
 */
@SpringBootTest
@DisplayName("A consumer that substitutes its own beans")
class ConsumerOverrideTest {

    @Autowired
    private ApplicationContext context;

    @Test
    @DisplayName("replaces the user store")
    void replacesTheUserStore() {
        assertThat(context.getBean(UserDetailsService.class)).isInstanceOf(InMemoryUserDetailsManager.class);
        assertThat(context.containsBean("starterUserDetailsService")).isFalse();
        assertThat(context.containsBean("starterAccountController")).isFalse();
    }

    @Test
    @DisplayName("replaces the security chain")
    void replacesTheSecurityChain() {
        assertThat(context.getBeansOfType(SecurityFilterChain.class))
                .hasSize(1)
                .containsKey("consumerSecurityFilterChain");
    }

    @Test
    @DisplayName("replaces the password encoder")
    void replacesThePasswordEncoder() {
        assertThat(context.getBean(PasswordEncoder.class)).isInstanceOf(NoOpPasswordEncoder.class);
    }

    @Test
    @DisplayName("replaces the history sink")
    void replacesTheHistorySink() {
        assertThat(context.getBean(HistoryEventsRecorder.class)).isInstanceOf(RecordingHistorySink.class);
    }

    @Test
    @DisplayName("replaces history actor and read policies")
    void replacesHistoryPolicies() {
        assertThat(context.getBean(HistoryActorResolver.class)).isInstanceOf(FixedHistoryActorResolver.class);
        assertThat(context.getBean(HistoryReadAuthorizer.class)).isInstanceOf(FixedHistoryReadAuthorizer.class);
    }

    @Test
    @DisplayName("replaces the offline actor resolver")
    void replacesTheOfflineActorResolver() {
        assertThat(context.getBean(OfflineActorResolver.class)).isInstanceOf(FixedActorResolver.class);
        assertThat(context.getBeansOfType(StarterOfflineActorResolver.class)).isEmpty();
    }

    /**
     * Substituting five beans must not quietly withdraw the rest of the library.
     */
    @Test
    @DisplayName("keeps everything it did not replace")
    void keepsEverythingItDidNotReplace() {
        assertThat(context.getBean(QueryEngineRegistry.class)).isNotNull();
        assertThat(context.getBean(OfflineSyncService.class)).isNotNull();
        assertThat(context.containsBean("starterHistoryController")).isTrue();
        assertThat(context.containsBean("starterAuthController")).isTrue();
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class Substitutions {

        @Bean
        UserDetailsService consumerUserDetailsService() {
            UserDetails user = User.withUsername("consumer").password("secret").roles("ANYTHING").build();
            return new InMemoryUserDetailsManager(user);
        }

        @Bean
        @SuppressWarnings("deprecation")
        PasswordEncoder consumerPasswordEncoder() {
            return NoOpPasswordEncoder.getInstance();
        }

        @Bean
        SecurityFilterChain consumerSecurityFilterChain(HttpSecurity http) throws Exception {
            return http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll()).build();
        }

        @Bean
        HistoryEventsRecorder consumerHistorySink() {
            return new RecordingHistorySink();
        }

        @Bean
        HistoryActorResolver consumerHistoryActorResolver() {
            return new FixedHistoryActorResolver();
        }

        @Bean("historyReadAuthorizer")
        HistoryReadAuthorizer consumerHistoryReadAuthorizer() {
            return new FixedHistoryReadAuthorizer();
        }

        @Bean
        OfflineActorResolver consumerActorResolver() {
            return new FixedActorResolver();
        }
    }

    /** Does nothing on purpose. These tests are about which bean is present. */
    static class RecordingHistorySink implements HistoryEventsRecorder {

        @Override
        public void recordCreate(HistoryEntityType entity, Object entityId, Object currentDto) {
        }

        @Override
        public void recordUpdate(HistoryEntityType entity, Object entityId, Object previousDto, Object currentDto) {
        }

        @Override
        public void recordDelete(HistoryEntityType entity, Object entityId, Object previousDto) {
        }
    }

    static class FixedActorResolver implements OfflineActorResolver {

        @Override
        public Optional<OfflineActor> resolveCurrentActor() {
            return Optional.empty();
        }
    }

    static class FixedHistoryActorResolver implements HistoryActorResolver {

        @Override
        public Optional<HistoryActor> resolveCurrentActor() {
            return Optional.of(new HistoryActor("consumer-1", "Consumer"));
        }
    }

    static class FixedHistoryReadAuthorizer implements HistoryReadAuthorizer {

        @Override
        public boolean canRead(org.springframework.security.core.Authentication authentication,
                String entity, String entityId) {
            return true;
        }
    }
}
