package com.vireocode.vireo.history;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;

/** Enforces History retention, quota, purge, erasure, and legal-hold mechanics. */
public class HistoryDataLifecycleService {

    private final HistoryRepository repository;
    private final StarterHistoryProperties properties;
    private final Clock clock;
    private final ApplicationEventPublisher events;

    HistoryDataLifecycleService(HistoryRepository repository, StarterHistoryProperties properties,
            Clock clock, ApplicationEventPublisher events) {
        this.repository = repository;
        this.properties = properties;
        this.clock = clock;
        this.events = events;
    }

    @Transactional
    HistoryEntry store(HistoryEntry entry) {
        purgeExpired(entry.getLifecyclePartition(), Instant.now(clock));
        long count = repository.countByLifecyclePartition(entry.getLifecyclePartition());
        if (count >= properties.getMaxRecordsPerPartition()) {
            int required = Math.toIntExact(count - properties.getMaxRecordsPerPartition() + 1);
            List<HistoryEntry> removable = repository
                    .findByLifecyclePartitionAndLegalHoldFalseOrderByOccurredAtAscIdAsc(
                            entry.getLifecyclePartition(), PageRequest.of(0, required));
            if (removable.size() < required) {
                events.publishEvent(new HistoryDataLifecycleEvent(
                        HistoryDataLifecycleEvent.Operation.QUOTA_REJECTED, 0,
                        repository.countByLifecyclePartitionAndLegalHoldTrue(entry.getLifecyclePartition())));
                throw new HistoryDataLifecycleException(
                        "History partition quota is exhausted by legally held records.");
            }
            repository.deleteAllInBatch(removable);
            events.publishEvent(new HistoryDataLifecycleEvent(
                    HistoryDataLifecycleEvent.Operation.PURGED, removable.size(), 0));
        }
        HistoryEntry saved = repository.save(entry);
        events.publishEvent(new HistoryDataLifecycleEvent(HistoryDataLifecycleEvent.Operation.CLASSIFIED, 1, 0));
        return saved;
    }

    @Transactional
    public int purgeExpired(String partitionKey) {
        return purgeExpired(requirePartition(partitionKey), Instant.now(clock));
    }

    @Transactional
    public int eraseActor(String partitionKey, String actorId) {
        String partition = requirePartition(partitionKey);
        if (actorId == null || actorId.isBlank()) {
            throw new IllegalArgumentException("history actorId must not be blank");
        }
        int erased = repository.eraseActor(partition, actorId.trim());
        long held = repository.countByLifecyclePartitionAndActorIdAndLegalHoldTrue(partition, actorId.trim());
        events.publishEvent(new HistoryDataLifecycleEvent(HistoryDataLifecycleEvent.Operation.ERASED, erased, held));
        return erased;
    }

    /** Places or releases a hold for one record inside an explicit partition. */
    @Transactional
    public boolean setLegalHold(String partitionKey, UUID recordId, boolean held) {
        String partition = requirePartition(partitionKey);
        int changed = repository.setLegalHold(partition, Objects.requireNonNull(recordId, "recordId"), held);
        events.publishEvent(new HistoryDataLifecycleEvent(
                held ? HistoryDataLifecycleEvent.Operation.HOLD_PLACED
                        : HistoryDataLifecycleEvent.Operation.HOLD_RELEASED,
                changed, held ? changed : 0));
        return changed == 1;
    }

    private int purgeExpired(String partition, Instant now) {
        int purged = repository.purgeExpired(partition, now);
        events.publishEvent(new HistoryDataLifecycleEvent(HistoryDataLifecycleEvent.Operation.PURGED, purged, 0));
        return purged;
    }

    private String requirePartition(String partitionKey) {
        if (partitionKey == null || partitionKey.isBlank() || partitionKey.length() > 140) {
            throw new IllegalArgumentException("history partitionKey must contain 1 to 140 characters");
        }
        return partitionKey.trim();
    }
}
