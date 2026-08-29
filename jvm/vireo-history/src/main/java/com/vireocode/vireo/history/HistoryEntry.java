package com.vireocode.vireo.history;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Append-only audit log row capturing a single create/update/delete change to a
 * managed entity. The action is derived from the snapshot pair:
 * previous {@code null} -> create, current {@code null} -> delete, otherwise
 * update.
 *
 * <p>
 * Snapshots are stored as serialized JSON text (portable across H2 and
 * PostgreSQL); the frontend consumes the parsed JSON to compute field diffs.
 */
@Entity
@Table(name = "history")
@Getter
@Setter
@NoArgsConstructor
class HistoryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "actor_id", length = 128)
    private String actorId;

    @Column(name = "actor_label", length = 100)
    private String actorLabel;

    @Column(name = "entity", nullable = false, length = 32)
    private String entity;

    @Column(name = "entity_id", nullable = false, length = 64)
    private String entityId;

    @Column(name = "snapshot_previous", columnDefinition = "text")
    private String snapshotPrevious;

    @Column(name = "snapshot_current", columnDefinition = "text")
    private String snapshotCurrent;

    @Column(name = "lifecycle_partition", nullable = false, length = 140)
    private String lifecyclePartition;

    @Column(name = "retain_until", nullable = false)
    private Instant retainUntil;

    @Column(name = "legal_hold", nullable = false)
    private boolean legalHold;
}
