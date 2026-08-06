package com.vireocode.starter.base;

import java.time.Instant;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

/**
 * Shared superclass for managed domain entities. Holds auditing metadata, the
 * denormalized {@code keywords} search column, and the {@code deleted} soft-delete
 * flag. Deletion strategy (soft vs physical) is controlled per entity through
 * {@link EntityConfig} on the owning {@link BaseService}.
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public abstract class BaseEntity {
    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant modifiedAt;

    @CreatedBy
    private String createdBy;

    @LastModifiedBy
    private String modifiedBy;

    @Column(name = "keywords", length = 2048)
    private String keywords;

    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;
}
