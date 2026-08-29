package com.vireocode.vireo.config;

import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import tools.jackson.databind.JavaType;
import tools.jackson.databind.cfg.MapperConfig;
import tools.jackson.databind.introspect.AccessorNamingStrategy;
import tools.jackson.databind.introspect.AnnotatedClass;
import tools.jackson.databind.introspect.AnnotatedMethod;
import tools.jackson.databind.introspect.DefaultAccessorNamingStrategy;

@Configuration(proxyBeanMethods = false)
class JsonConfig {
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE + 100)
    JsonMapperBuilderCustomizer starterJsonMapperBuilderCustomizer() {
        return builder -> builder.accessorNaming(new BooleanIsPrefixAccessorNamingStrategyProvider());
    }

    static final class BooleanIsPrefixAccessorNamingStrategyProvider extends DefaultAccessorNamingStrategy.Provider {
        @Override
        public AccessorNamingStrategy forPOJO(MapperConfig<?> config, AnnotatedClass valueClass) {
            return new BooleanIsPrefixAccessorNamingStrategy(
                    config,
                    valueClass,
                    _setterPrefix,
                    _getterPrefix,
                    _isGetterPrefix,
                    _baseNameValidator);
        }
    }

    static final class BooleanIsPrefixAccessorNamingStrategy extends DefaultAccessorNamingStrategy {
        BooleanIsPrefixAccessorNamingStrategy(
                MapperConfig<?> config,
                AnnotatedClass forClass,
                String setterPrefix,
                String getterPrefix,
                String isGetterPrefix,
                BaseNameValidator baseNameValidator) {
            super(config, forClass, setterPrefix, getterPrefix, isGetterPrefix, baseNameValidator);
        }

        @Override
        public String findNameForIsGetter(AnnotatedMethod am, String name) {
            if (isBooleanType(am.getType())) {
                return name;
            }
            return super.findNameForIsGetter(am, name);
        }

        @Override
        public String findNameForMutator(AnnotatedMethod am, String name) {
            if (name.startsWith(_mutatorPrefix)
                    && am.getParameterCount() == 1
                    && isBooleanType(am.getParameterType(0))) {
                String baseName = name.substring(_mutatorPrefix.length());
                if (!baseName.isEmpty()) {
                    return _isGetterPrefix + baseName;
                }
            }
            return super.findNameForMutator(am, name);
        }

        private boolean isBooleanType(JavaType type) {
            return type.hasRawClass(Boolean.TYPE) || type.hasRawClass(Boolean.class);
        }
    }
}
