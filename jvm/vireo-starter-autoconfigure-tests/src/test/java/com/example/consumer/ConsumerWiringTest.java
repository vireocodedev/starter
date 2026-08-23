package com.example.consumer;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.transaction.annotation.Transactional;

import com.vireocode.starter.auth.AccountController;
import com.vireocode.starter.auth.AuthController;
import com.vireocode.starter.auth.DatabaseUserDetailsService;
import com.vireocode.starter.auth.StarterUserRepository;
import com.vireocode.starter.base.JsonNodeMapper;
import com.vireocode.starter.base.JsonNullableMapper;
import com.vireocode.starter.offline.OfflineEntityVersionRepository;
import com.vireocode.starter.offline.OfflineHeartbeatController;
import com.vireocode.starter.offline.OfflineHydrationController;
import com.vireocode.starter.offline.OfflineSyncController;
import com.vireocode.starter.offline.OfflineSyncService;
import com.vireocode.starter.queryengine.QueryEngineController;
import com.vireocode.starter.queryengine.QueryEngineMetadataGenerator;
import com.vireocode.starter.queryengine.QueryEngineRegistry;
import com.vireocode.starter.queryengine.savedfilter.SavedFilterController;
import com.vireocode.starter.queryengine.savedfilter.SavedFilterRepository;
import com.vireocode.starter.queryengine.savedfilter.SavedFilterService;
import com.vireocode.starter.spi.FilterSpecificationBuilder;
import com.vireocode.starter.spi.OfflineChangeBroadcaster;
import com.vireocode.starter.spi.OfflineRevisionTracker;
import com.vireocode.starter.web.GlobalExceptionHandler;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * The dependency alone has to be enough.
 *
 * <p>
 * {@link ConsumerApplication} declares nothing but {@code @SpringBootApplication}
 * and sits in a package the library cannot see. Every assertion below therefore
 * fails the moment auto-configuration stops carrying its own weight.
 */
@SpringBootTest
@DisplayName("A consumer that only adds the dependency")
class ConsumerWiringTest {

    @Autowired
    private ApplicationContext context;

    @Test
    @DisplayName("gets the core layer")
    void getsTheCoreLayer() {
        assertThat(context.getBean(ObjectMapper.class)).isNotNull();
        assertThat(context.getBean(GlobalExceptionHandler.class)).isNotNull();
        assertThat(context.getBean(JsonNodeMapper.class)).isNotNull();
        assertThat(context.getBean(JsonNullableMapper.class)).isNotNull();
    }

    @Test
    @DisplayName("gets the authentication stack")
    void getsTheAuthenticationStack() {
        assertThat(context.getBean(UserDetailsService.class)).isInstanceOf(DatabaseUserDetailsService.class);
        assertThat(context.getBean(PasswordEncoder.class)).isNotNull();
        assertThat(context.getBean(SecurityFilterChain.class)).isNotNull();
        assertThat(context.getBean(AuthController.class)).isNotNull();
        assertThat(context.getBean(AccountController.class)).isNotNull();
    }

    @Test
    @DisplayName("gets the query engine")
    void getsTheQueryEngine() {
        assertThat(context.getBean(QueryEngineRegistry.class)).isNotNull();
        assertThat(context.getBean(QueryEngineMetadataGenerator.class)).isNotNull();
        assertThat(context.getBean(QueryEngineController.class)).isNotNull();
        assertThat(context.getBean(SavedFilterService.class)).isNotNull();
        assertThat(context.getBean(SavedFilterController.class)).isNotNull();
    }

    @Test
    @DisplayName("gets the offline stack")
    void getsTheOfflineStack() {
        assertThat(context.getBean(OfflineSyncService.class)).isNotNull();
        assertThat(context.getBean(OfflineSyncController.class)).isNotNull();
        assertThat(context.getBean(OfflineHeartbeatController.class)).isNotNull();
        assertThat(context.getBean(OfflineHydrationController.class)).isNotNull();
    }

    @Test
    @DisplayName("gets the history stack")
    void getsTheHistoryStack() {
        assertThat(context.containsBean("starterHistoryController")).isTrue();
    }

    /**
     * The service-provider interfaces core declares are satisfied by the modules
     * above it. If these were missing, {@code BaseService} would still start —
     * the fields are optional — and would silently stop filtering and stop
     * broadcasting, which is exactly the kind of failure worth a test.
     */
    @Test
    @DisplayName("has core's service-provider interfaces satisfied from above")
    void hasCoreServiceProviderInterfacesSatisfied() {
        assertThat(context.getBean(FilterSpecificationBuilder.class)).isNotNull();
        assertThat(context.getBean(OfflineRevisionTracker.class)).isNotNull();
        assertThat(context.getBean(OfflineChangeBroadcaster.class)).isNotNull();
    }

    /**
     * Repositories in a package the consumer never named, found because the
     * library contributed its own package to the auto-configuration packages.
     */
    @Test
    @DisplayName("gets the library's repositories")
    void getsTheLibraryRepositories() {
        assertThat(context.getBean(StarterUserRepository.class)).isNotNull();
        assertThat(context.getBean(SavedFilterRepository.class)).isNotNull();
        assertThat(context.containsBean("historyRepository")).isTrue();
        assertThat(context.getBean(OfflineEntityVersionRepository.class)).isNotNull();
    }

    /**
     * The other half of the same question, and the reason {@code @EntityScan} and
     * {@code @EnableJpaRepositories} were not used. Both would have worked for
     * the assertions above while quietly breaking this one.
     */
    @Test
    @Transactional
    @DisplayName("still gets its own entities and repositories")
    void stillGetsItsOwnEntitiesAndRepositories(@Autowired ConsumerWidgetRepository repository) {
        ConsumerWidget widget = new ConsumerWidget();
        widget.setName("discovered");

        Long id = repository.saveAndFlush(widget).getId();

        assertThat(repository.findById(id)).get().extracting(ConsumerWidget::getName).isEqualTo("discovered");
    }

    /**
     * Auditing is enabled by the library because {@code BaseEntity} depends on it.
     * Without this bean, created and modified timestamps would be null on every
     * row and nothing would complain.
     */
    @Test
    @DisplayName("gets JPA auditing switched on")
    void getsJpaAuditingSwitchedOn() {
        assertThat(context.containsBean("jpaAuditingHandler")).isTrue();
    }
}
