package com.vireocode.vireo.offline;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;

public interface OfflineSyncCommandRepository extends JpaRepository<OfflineSyncCommandEntity, UUID>,
        JpaSpecificationExecutor<OfflineSyncCommandEntity> {
    List<OfflineSyncCommandEntity> findAllByCommandIdIn(Collection<UUID> commandIds);

    long countByLifecyclePartition(String lifecyclePartition);

    long countByLifecyclePartitionAndLegalHoldTrue(String lifecyclePartition);

    long countByLifecyclePartitionAndOwnerKeyAndLegalHoldTrue(String lifecyclePartition, String ownerKey);

    List<OfflineSyncCommandEntity> findByLifecyclePartitionAndLegalHoldFalseOrderByCreatedAtAscIdAsc(
            String lifecyclePartition, Pageable pageable);

    @Modifying
    @Query("delete from OfflineSyncCommandEntity c where c.lifecyclePartition = :partition and c.legalHold = false and c.retainUntil <= :now")
    int purgeExpired(@Param("partition") String partition, @Param("now") java.time.Instant now);

    @Modifying
    @Query("delete from OfflineSyncCommandEntity c where c.lifecyclePartition = :partition and c.ownerKey = :ownerKey and c.legalHold = false")
    int eraseOwner(@Param("partition") String partition, @Param("ownerKey") String ownerKey);

    @Modifying
    @Query("update OfflineSyncCommandEntity c set c.legalHold = :held where c.lifecyclePartition = :partition and c.commandId = :commandId")
    int setLegalHold(@Param("partition") String partition, @Param("commandId") UUID commandId,
            @Param("held") boolean held);
}
