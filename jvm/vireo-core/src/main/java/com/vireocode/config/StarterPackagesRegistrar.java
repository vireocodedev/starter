package com.vireocode.config;

import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.boot.autoconfigure.AutoConfigurationPackages;
import org.springframework.context.annotation.ImportBeanDefinitionRegistrar;
import org.springframework.core.type.AnnotationMetadata;

/**
 * Adds {@code com.vireocode} to the set of packages Spring Boot treats
 * as auto-configuration packages.
 *
 * <p>
 * Until the JVM libraries were extracted, the starter's entities and
 * repositories were found only because they happened to sit below the consuming
 * application's {@code @SpringBootApplication} package. They no longer do, so
 * something has to tell Boot where they live.
 *
 * <p>
 * The obvious tools are the wrong ones. {@code @EntityScan} replaces the
 * default
 * entity packages rather than adding to them, so declaring it here would hide
 * the consumer's own entities. {@code @EnableJpaRepositories} makes Boot's
 * {@code JpaRepositoriesAutoConfiguration} back off entirely, so declaring it
 * here would stop the consumer's own repositories from being discovered. Both
 * would trade the library's wiring for the application's.
 *
 * <p>
 * Registering the package instead is additive: Boot's own entity scanning and
 * repository scanning both fall back to the auto-configuration packages, so the
 * library and the application are found by the same mechanism and neither
 * displaces the other.
 */
class StarterPackagesRegistrar implements ImportBeanDefinitionRegistrar {

    static final String STARTER_BASE_PACKAGE = "com.vireocode";

    @Override
    public void registerBeanDefinitions(AnnotationMetadata metadata, BeanDefinitionRegistry registry) {
        AutoConfigurationPackages.register(registry, STARTER_BASE_PACKAGE);
    }
}
