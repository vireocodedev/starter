package com.vireocode.starter.queryengine.savedfilter;

import com.vireocode.starter.auth.StarterUser;
import com.vireocode.starter.base.BaseEntity;
import com.vireocode.starter.queryengine.Filterable;
import com.vireocode.starter.queryengine.QueryOperator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "saved_filter")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SavedFilter extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_saved_filter_user"))
    @NotNull
    private StarterUser user;

    @Column(name = "name", nullable = false)
    @NotBlank
    @Filterable(label = "common.name", operators = { QueryOperator.CONTAINS, QueryOperator.EQUALS,
            QueryOperator.STARTS_WITH,
            QueryOperator.ENDS_WITH })
    private String name;

    @Column(name = "description", length = 2000)
    @Filterable(label = "savedFilter.description", operators = { QueryOperator.CONTAINS, QueryOperator.EQUALS })
    private String description;

    @Column(name = "entity_name", nullable = false)
    @NotBlank
    @Filterable(label = "savedFilter.entityName", operators = { QueryOperator.CONTAINS, QueryOperator.EQUALS })
    private String entityName;

    @Column(name = "engine_version", nullable = false, length = 50)
    @NotBlank
    @Filterable(label = "savedFilter.engineVersion", operators = { QueryOperator.EQUALS, QueryOperator.CONTAINS })
    private String engineVersion;

    @Column(name = "filters_json", nullable = false, columnDefinition = "TEXT")
    @NotBlank
    private String filtersJson;

    @Column(name = "is_public", nullable = false)
    @Filterable(label = "savedFilter.public", operators = { QueryOperator.EQUALS })
    private boolean isPublic;

    @Column(name = "is_default", nullable = false)
    @Filterable(label = "savedFilter.default", operators = { QueryOperator.EQUALS })
    private boolean isDefault;
}
