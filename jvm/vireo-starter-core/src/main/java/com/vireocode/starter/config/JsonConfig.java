package com.vireocode.starter.config;

import org.openapitools.jackson.nullable.JsonNullableModule;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.cfg.MapperConfig;
import com.fasterxml.jackson.databind.introspect.AccessorNamingStrategy;
import com.fasterxml.jackson.databind.introspect.AnnotatedClass;
import com.fasterxml.jackson.databind.introspect.AnnotatedMethod;
import com.fasterxml.jackson.databind.introspect.DefaultAccessorNamingStrategy;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration(proxyBeanMethods = false)
public class JsonConfig {
    @Bean
    @ConditionalOnMissingBean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = JsonMapper.builder()
                .addModule(new JavaTimeModule())
                .addModule(new JsonNullableModule())
                .accessorNaming(new BooleanIsPrefixAccessorNamingStrategyProvider())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .disable(DeserializationFeature.READ_DATE_TIMESTAMPS_AS_NANOSECONDS)
                .disable(SerializationFeature.WRITE_DATE_TIMESTAMPS_AS_NANOSECONDS)
                .build();

        objectMapper.setDefaultPropertyInclusion(JsonInclude.Include.ALWAYS);

        return objectMapper;
    }

    @Bean
    @ConditionalOnMissingBean
    public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter(ObjectMapper objectMapper) {
        return new MappingJackson2HttpMessageConverter(objectMapper);
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