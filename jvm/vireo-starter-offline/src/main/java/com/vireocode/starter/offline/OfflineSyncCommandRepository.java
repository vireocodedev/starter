package com.vireocode.starter.offline;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface OfflineSyncCommandRepository extends JpaRepository<OfflineSyncCommandEntity, UUID>,
        JpaSpecificationExecutor<OfflineSyncCommandEntity> {
    List<OfflineSyncCommandEntity> findAllByCommandIdIn(Collection<UUID> commandIds);
}
