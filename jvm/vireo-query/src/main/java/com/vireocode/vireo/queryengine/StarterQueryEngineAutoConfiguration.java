package com.vireocode.vireo.queryengine;

import java.util.List;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.vireocode.vireo.auth.StarterUserRepository;
import com.vireocode.vireo.flyway.StarterFlywayModule;
import com.vireocode.vireo.queryengine.savedfilter.SavedFilterController;
import com.vireocode.vireo.queryengine.savedfilter.SavedFilterMapper;
import com.vireocode.vireo.queryengine.savedfilter.SavedFilterMapperImpl;
import com.vireocode.vireo.queryengine.savedfilter.SavedFilterRepository;
import com.vireocode.vireo.queryengine.savedfilter.SavedFilterService;
import com.vireocode.vireo.spi.FilterSpecificationBuilder;

/**
 * Wires the query engine from the dependency alone.
 *
 * <p>
 * The collection parameters are the point of this module rather than an
 * accident of it. {@code QueryEntityTypeResolver},
 * {@code QueryCustomFieldProvider} and {@code QueryCustomFieldResolver} beans
 * declared by a consumer are injected here, so registering a new filterable
 * entity is a matter of publishing a bean rather than editing the library.
 */
@AutoConfiguration
@EnableConfigurationProperties(StarterQueryEngineProperties.class)
public class StarterQueryEngineAutoConfiguration {

    /** Optional Micrometer bridge; safe events remain available without it. */
    @Configuration(proxyBeanMethods = false)
    @ConditionalOnClass(name = "io.micrometer.observation.ObservationRegistry")
    @ConditionalOnBean(type = "io.micrometer.observation.ObservationRegistry")
    static class StarterQueryEngineObservabilityConfiguration {

        @Bean
        @ConditionalOnMissingBean(name = "starterQueryEngineMicrometerObservations")
        QueryEngineMicrometerObservations starterQueryEngineMicrometerObservations(
                io.micrometer.observation.ObservationRegistry registry) {
            return new QueryEngineMicrometerObservations(registry);
        }
    }

    @Bean
    StarterFlywayModule queryEngineFlywayModule() {
        return new StarterFlywayModule("queryengine", 20);
    }

    @Bean
    @ConditionalOnMissingBean
    QueryEngineRegistry queryEngineRegistry(List<QueryEntityTypeResolver> resolvers) {
        return new QueryEngineRegistry(resolvers);
    }

    @Bean
    @ConditionalOnMissingBean
    QueryEngineMetadataGenerator queryEngineMetadataGenerator(QueryEngineRegistry registry,
            List<QueryCustomFieldProvider> customFieldProviders) {
        return new QueryEngineMetadataGenerator(registry, customFieldProviders);
    }

    /**
     * Also the {@link FilterSpecificationBuilder} implementation core declares as
     * a service-provider interface, which is how {@code BaseService} filters
     * without core depending on this module. Keyed on its own type rather than
     * on the interface, because the offline module depends on the concrete
     * class.
     */
    @Bean
    @ConditionalOnMissingBean
    QueryEngineFilterSpecificationBuilder queryEngineFilterSpecificationBuilder(QueryEngineRegistry registry,
            QueryEngineMetadataGenerator generator, List<QueryCustomFieldResolver<?>> customFieldResolvers) {
        return new QueryEngineFilterSpecificationBuilder(registry, generator, customFieldResolvers);
    }

    @Bean
    @ConditionalOnMissingBean
    QueryRelationOptionPolicy queryRelationOptionPolicy() {
        return new DenyAllQueryRelationOptionPolicy();
    }

    @Bean
    @ConditionalOnMissingBean
    QueryEngineRelationOptionService queryEngineRelationOptionService(QueryEngineRegistry registry,
            QueryEngineMetadataGenerator generator, StarterQueryEngineProperties properties,
            QueryRelationOptionPolicy relationOptionPolicy, ApplicationEventPublisher events) {
        return new QueryEngineRelationOptionService(registry, generator, properties, relationOptionPolicy, events);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnProperty(prefix = "vireo.starter.query-engine", name = "endpoint-enabled", matchIfMissing = true)
    QueryEngineController queryEngineController(QueryEngineRegistry registry, QueryEngineMetadataGenerator generator,
            QueryEngineRelationOptionService relationOptionService) {
        return new QueryEngineController(registry, generator, relationOptionService);
    }

    /**
     * MapStruct generates this implementation with {@code @Autowired} fields for
     * whichever collaborators the current mappings need. Returning it from a
     * {@code @Bean} method is still safe: field injection is applied to every
     * bean the container owns, so the set of collaborators can change when the
     * mappings do without this method having to change with it.
     */
    @Bean
    @ConditionalOnMissingBean
    SavedFilterMapper savedFilterMapper() {
        return new SavedFilterMapperImpl();
    }

    @Bean
    @ConditionalOnMissingBean
    SavedFilterService savedFilterService(SavedFilterRepository repository, SavedFilterMapper mapper,
            StarterUserRepository userRepository, QueryEngineRegistry registry,
            QueryEngineFilterSpecificationBuilder filterSpecificationBuilder) {
        return new SavedFilterService(repository, mapper, userRepository, registry, filterSpecificationBuilder);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnProperty(prefix = "vireo.starter.query-engine", name = "saved-filters-endpoint-enabled", matchIfMissing = true)
    SavedFilterController savedFilterController(SavedFilterService service) {
        return new SavedFilterController(service);
    }
}
