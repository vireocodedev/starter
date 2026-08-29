package com.vireocode.vireo.offline;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

/** Enforces Offline retention, quota, purge, erasure, and legal holds per partition. */
public class OfflineDataLifecycleService {

    private final OfflineSyncCommandRepository repository;
    private final StarterOfflineProperties properties;
    private final Clock clock;
    private final ApplicationEventPublisher events;

    OfflineDataLifecycleService(OfflineSyncCommandRepository repository, StarterOfflineProperties properties,
            Clock clock, ApplicationEventPublisher events) {
        this.repository = repository;
        this.properties = properties;
        this.clock = clock;
        this.events = events;
    }

    @Transactional
    void admit(OfflineSyncCommandEntity entry) {
        purgeExpired(entry.getLifecyclePartition(), Instant.now(clock));
        long count = repository.countByLifecyclePartition(entry.getLifecyclePartition());
        if (count < properties.getMaxCommandsPerPartition()) {
            return;
        }
        int required = Math.toIntExact(count - properties.getMaxCommandsPerPartition() + 1);
        List<OfflineSyncCommandEntity> removable = repository
                .findByLifecyclePartitionAndLegalHoldFalseOrderByCreatedAtAscIdAsc(
                        entry.getLifecyclePartition(), PageRequest.of(0, required));
        if (removable.size() < required) {
            events.publishEvent(new OfflineDataLifecycleEvent(
                    OfflineDataLifecycleEvent.Operation.QUOTA_REJECTED, 0,
                    repository.countByLifecyclePartitionAndLegalHoldTrue(entry.getLifecyclePartition())));
            throw new OfflineDataLifecycleException(
                    "Offline command partition quota is exhausted by legally held records.");
        }
        repository.deleteAllInBatch(removable);
        events.publishEvent(new OfflineDataLifecycleEvent(
                OfflineDataLifecycleEvent.Operation.PURGED, removable.size(), 0));
    }

    void redacted() {
        events.publishEvent(new OfflineDataLifecycleEvent(OfflineDataLifecycleEvent.Operation.CLASSIFIED, 1, 0));
    }

    @Transactional
    public int purgeExpired(String partitionKey) {
        return purgeExpired(requireKey(partitionKey, "partitionKey"), Instant.now(clock));
    }

    @Transactional
    public int eraseOwner(String partitionKey, String ownerKey) {
        String partition = requireKey(partitionKey, "partitionKey");
        String owner = requireKey(ownerKey, "ownerKey");
        int erased = repository.eraseOwner(partition, owner);
        long held = repository.countByLifecyclePartitionAndOwnerKeyAndLegalHoldTrue(partition, owner);
        events.publishEvent(new OfflineDataLifecycleEvent(OfflineDataLifecycleEvent.Operation.ERASED, erased, held));
        return erased;
    }

    /** Places or releases a hold for one command inside an explicit partition. */
    @Transactional
    public boolean setLegalHold(String partitionKey, UUID commandId, boolean held) {
        String partition = requireKey(partitionKey, "partitionKey");
        int changed = repository.setLegalHold(partition, Objects.requireNonNull(commandId, "commandId"), held);
        events.publishEvent(new OfflineDataLifecycleEvent(
                held ? OfflineDataLifecycleEvent.Operation.HOLD_PLACED
                        : OfflineDataLifecycleEvent.Operation.HOLD_RELEASED,
                changed, held ? changed : 0));
        return changed == 1;
    }

    private int purgeExpired(String partition, Instant now) {
        int purged = repository.purgeExpired(partition, now);
        events.publishEvent(new OfflineDataLifecycleEvent(OfflineDataLifecycleEvent.Operation.PURGED, purged, 0));
        return purged;
    }

    private String requireKey(String key, String field) {
        if (key == null || key.isBlank() || key.length() > 140) {
            throw new IllegalArgumentException("offline " + field + " must contain 1 to 140 characters");
        }
        return key.trim();
    }
}
