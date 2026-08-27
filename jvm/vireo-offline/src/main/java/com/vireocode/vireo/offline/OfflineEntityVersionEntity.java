package com.vireocode.vireo.offline;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "offline_entity_version")
@Getter
@Setter
@NoArgsConstructor
public class OfflineEntityVersionEntity {

    @Id
    @Column(name = "entity_key", nullable = false, length = 64)
    private String entityKey;

    @Column(name = "revision", nullable = false)
    private long revision;

    @Column(name = "changed_at")
    private Instant changedAt;
}
