package com.vireocode.starter.config;

import java.util.Comparator;
import java.util.Optional;

import javax.sql.DataSource;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.data.jpa.autoconfigure.DataJpaRepositoriesAutoConfiguration;
import org.springframework.boot.flyway.autoconfigure.FlywayMigrationStrategy;
import org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration;
import org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.vireocode.starter.base.JsonNodeMapper;
import com.vireocode.starter.base.JsonNodeMapperImpl;
import com.vireocode.starter.base.JsonNullableMapper;
import com.vireocode.starter.base.JsonNullableMapperImpl;
import com.vireocode.starter.flyway.StarterFlywayMigrations;
import com.vireocode.starter.flyway.StarterFlywayModule;
import com.vireocode.starter.web.GlobalExceptionHandler;

/**
 * Wires everything in {@code vireo-starter-core} from the dependency alone.
 *
 * <p>
 * Ordered before Boot's JPA auto-configurations because
 * {@link StarterPackagesRegistrar} has to have contributed the starter's base
 * package before entity scanning and repository scanning read it, and before
 * Jackson's because the library replaces the default {@code ObjectMapper}.
 *
 * <p>
 * Every bean here is {@link ConditionalOnMissingBean}. A consumer overrides one
 * by declaring a bean of the same type; the library's default then backs off,
 * and nothing needs to be forked to make that happen.
 */
@AutoConfiguration(before = {
        DataJpaRepositoriesAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class,
        JacksonAutoConfiguration.class })
@Import({ StarterPackagesRegistrar.class, JsonConfig.class, MessageSourceConfig.class, OpenApiConfig.class })
public class StarterCoreAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    GlobalExceptionHandler starterGlobalExceptionHandler(Environment environment) {
        return new GlobalExceptionHandler(environment);
    }

    /**
     * Runs every library module's migrations, each into its own history table,
     * before handing over to the consumer's own Flyway.
     *
     * <p>
     * A {@code FlywayMigrationStrategy} is the right hook because Boot passes
     * its own fully configured {@code Flyway} in. The library therefore inherits
     * the consumer's datasource — including a {@code spring.flyway.url} override
     * — rather than guessing at one, and library tables are guaranteed to exist
     * before the consumer's migrations run, which is what makes a foreign key
     * into {@code app_user} safe to write.
     */
    @Configuration(proxyBeanMethods = false)
    @ConditionalOnClass(Flyway.class)
    public static class StarterFlywayConfiguration {

        @Bean
        @ConditionalOnMissingBean
        FlywayMigrationStrategy starterFlywayMigrationStrategy(ObjectProvider<StarterFlywayModule> modules) {
            return consumerFlyway -> {
                DataSource dataSource = consumerFlyway.getConfiguration().getDataSource();
                String vendor = StarterFlywayMigrations.resolveVendor(dataSource);

                StarterFlywayMigrations.prepareConsumerHistory(consumerFlyway.getConfiguration());

                modules.orderedStream()
                        .sorted(Comparator.comparingInt(StarterFlywayModule::order))
                        .forEach(module -> StarterFlywayMigrations.migrate(module, dataSource, vendor));

                consumerFlyway.migrate();
            };
        }
    }

    @Bean
    @ConditionalOnMissingBean
    JsonNullableMapper starterJsonNullableMapper() {
        return new JsonNullableMapperImpl();
    }

    /**
     * {@code JsonNodeMapper} injects its {@code ObjectMapper} into a field. That
     * still works for a bean built here, because field injection is applied to
     * every bean the container owns regardless of how it was instantiated.
     */
    @Bean
    @ConditionalOnMissingBean
    JsonNodeMapper starterJsonNodeMapper() {
        return new JsonNodeMapperImpl();
    }

    /**
     * Every starter module annotates its endpoints with {@code @PreAuthorize}.
     * Those annotations do nothing at all unless method security is switched on,
     * and a silently unenforced authorization check is worse than none, so the
     * library enables it rather than trusting each consumer to remember.
     *
     * <p>
     * It lives in core rather than in the auth module because a consumer may
     * take the query engine or the offline stack without taking the starter's
     * authentication, and their endpoints are annotated just the same.
     *
     * <p>
     * Deliberately unguarded. A consumer who also declares
     * {@code @EnableMethodSecurity} is not a conflict: the annotation works by
     * importing configuration classes, and the configuration class parser
     * de-duplicates imports, so the infrastructure is registered once and any
     * extra options the consumer asked for are still added.
     */
    @Configuration(proxyBeanMethods = false)
    @ConditionalOnClass(EnableMethodSecurity.class)
    @EnableMethodSecurity
    public static class StarterMethodSecurityConfiguration {
    }

    /**
     * {@code BaseEntity} carries {@code @EntityListeners(AuditingEntityListener)},
     * which silently records nothing unless auditing is enabled somewhere. That
     * somewhere has to be the library, or every consumer would have to remember
     * to switch on a feature the library's own base class depends on.
     *
     * <p>
     * Guarded on the {@code jpaAuditingHandler} bean name rather than on a type:
     * {@code @EnableJpaAuditing} registers infrastructure under that name and
     * fails outright if it is applied twice, so a consumer who already enables
     * auditing must make this whole configuration back off.
     */
    @Configuration(proxyBeanMethods = false)
    @ConditionalOnClass(EnableJpaAuditing.class)
    @ConditionalOnMissingBean(name = "jpaAuditingHandler")
    @EnableJpaAuditing(auditorAwareRef = "starterAuditorProvider")
    public static class StarterJpaAuditingConfiguration {

        @Bean
        @ConditionalOnMissingBean
        AuditorAware<String> starterAuditorProvider() {
            return () -> {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                if (authentication == null || !authentication.isAuthenticated()
                        || authentication instanceof AnonymousAuthenticationToken) {
                    return Optional.of("system");
                }

                return Optional.ofNullable(authentication.getName())
                        .filter(name -> !name.isBlank())
                        .or(() -> Optional.of("system"));
            };
        }
    }
}
