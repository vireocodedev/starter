package com.vireocode.docs.core;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;
import org.springframework.stereotype.Service;

import com.vireocode.vireo.base.BaseEntity;
import com.vireocode.vireo.base.BaseMapper;
import com.vireocode.vireo.base.BaseService;
import com.vireocode.vireo.base.EntityConfig;
import com.vireocode.vireo.base.SearchableRepository;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

/** A complete, compact aggregate using Core's managed CRUD lifecycle. */
public final class CoreCrudWorkflowExample {

    private CoreCrudWorkflowExample() {
    }

    @Entity(name = "DocumentationProduct")
    public static class Product extends BaseEntity {
        @Id
        @GeneratedValue
        private Long id;
        private String name;
        private String category;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }
    }

    public static class ProductDto {
        private Long id;
        private String name;
        private String category;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }
    }

    public interface ProductRepository extends SearchableRepository<Product, Long> {
    }

    @Mapper(componentModel = MappingConstants.ComponentModel.SPRING, unmappedTargetPolicy = ReportingPolicy.IGNORE)
    public interface ProductMapper extends BaseMapper<Product, ProductDto> {
    }

    @Service
    public static final class ProductService extends BaseService<Long, Product, ProductDto> {
        public ProductService(ProductRepository repository, ProductMapper mapper) {
            super(repository, mapper, EntityConfig.builder()
                    .localSearchableFields(List.of("name", "category"))
                    .softDelete(true)
                    .build());
        }

        @Override
        protected void validateCreateRequest(ProductDto dto) {
            if (dto.getName() == null || dto.getName().isBlank()) {
                throw new IllegalArgumentException("Product name must not be blank");
            }
        }
    }
}
