package com.vireocode.docs.queryengine;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.vireocode.vireo.base.BaseEntity;
import com.vireocode.vireo.queryengine.Filterable;
import com.vireocode.vireo.queryengine.FilterableMetadata;
import com.vireocode.vireo.queryengine.QueryEntityKey;
import com.vireocode.vireo.queryengine.QueryEntityTypeResolver;
import com.vireocode.vireo.queryengine.RelationFilterMode;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Configuration(proxyBeanMethods = false)
public class QueryEngineRegistrationExample {

    public enum ApplicationQueryEntity implements QueryEntityKey {
        PRODUCT,
        CATEGORY
    }

    @Bean
    QueryEntityTypeResolver applicationQueryEntities() {
        return () -> Map.of(
                ApplicationQueryEntity.PRODUCT, Product.class,
                ApplicationQueryEntity.CATEGORY, Category.class);
    }

    @Entity(name = "DocumentationProductQueryEntity")
    @FilterableMetadata(title = "Products")
    public static class Product extends BaseEntity {
        @Id
        @GeneratedValue
        private Long id;

        @Filterable(label = "Product name")
        private String name;

        @Filterable
        private BigDecimal price;

        @ManyToOne
        @Filterable(
                label = "Category",
                relationMode = RelationFilterMode.SELECTION,
                relationSelectionLabelFields = { "name", "code" },
                multiple = true)
        private Category category;
    }

    @Entity(name = "DocumentationCategoryQueryEntity")
    @FilterableMetadata(title = "Categories", relationSelectionLabelFields = { "name", "code" })
    public static class Category extends BaseEntity {
        @Id
        @GeneratedValue
        private Long id;

        @Filterable
        private String name;

        @Filterable
        private String code;
    }
}
