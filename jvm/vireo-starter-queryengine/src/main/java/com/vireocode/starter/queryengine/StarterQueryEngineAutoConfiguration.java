package com.vireocode.starter.queryengine;

import java.util.List;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;

import com.vireocode.starter.auth.StarterUserRepository;
import com.vireocode.starter.queryengine.savedfilter.SavedFilterController;
import com.vireocode.starter.queryengine.savedfilter.SavedFilterMapper;
import com.vireocode.starter.queryengine.savedfilter.SavedFilterMapperImpl;
import com.vireocode.starter.queryengine.savedfilter.SavedFilterRepository;
import com.vireocode.starter.queryengine.savedfilter.SavedFilterService;
import com.vireocode.starter.spi.FilterSpecificationBuilder;

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
public class StarterQueryEngineAutoConfiguration {

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
            List<QueryCustomFieldResolver<?>> customFieldResolvers) {
        return new QueryEngineFilterSpecificationBuilder(registry, customFieldResolvers);
    }

    @Bean
    @ConditionalOnMissingBean
    QueryEngineRelationOptionService queryEngineRelationOptionService(QueryEngineRegistry registry,
            QueryEngineMetadataGenerator generator) {
        return new QueryEngineRelationOptionService(registry, generator);
    }

    @Bean
    @ConditionalOnMissingBean
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
            StarterUserRepository userRepository, QueryEngineRegistry registry) {
        return new SavedFilterService(repository, mapper, userRepository, registry);
    }

    @Bean
    @ConditionalOnMissingBean
    SavedFilterController savedFilterController(SavedFilterService service) {
        return new SavedFilterController(service);
    }
}
