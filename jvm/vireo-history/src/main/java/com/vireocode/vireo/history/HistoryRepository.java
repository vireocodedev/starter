package com.vireocode.vireo.history;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface HistoryRepository extends JpaRepository<HistoryEntry, java.util.UUID> {

    List<HistoryEntry> findByEntityAndEntityIdOrderByOccurredAtDescIdDesc(String entity, String entityId,
            Pageable pageable);

    long countByLifecyclePartition(String lifecyclePartition);

    long countByLifecyclePartitionAndLegalHoldTrue(String lifecyclePartition);

    long countByLifecyclePartitionAndActorIdAndLegalHoldTrue(String lifecyclePartition, String actorId);

    List<HistoryEntry> findByLifecyclePartitionAndLegalHoldFalseOrderByOccurredAtAscIdAsc(
            String lifecyclePartition, Pageable pageable);

    @Modifying
    @Query("delete from HistoryEntry h where h.lifecyclePartition = :partition and h.legalHold = false and h.retainUntil <= :now")
    int purgeExpired(@Param("partition") String partition, @Param("now") java.time.Instant now);

    @Modifying
    @Query("delete from HistoryEntry h where h.lifecyclePartition = :partition and h.actorId = :actorId and h.legalHold = false")
    int eraseActor(@Param("partition") String partition, @Param("actorId") String actorId);

    @Modifying
    @Query("update HistoryEntry h set h.legalHold = :held where h.lifecyclePartition = :partition and h.id = :recordId")
    int setLegalHold(@Param("partition") String partition, @Param("recordId") java.util.UUID recordId,
            @Param("held") boolean held);
}
