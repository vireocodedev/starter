package com.vireocode.starter.offline;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface OfflineEntityVersionRepository extends JpaRepository<OfflineEntityVersionEntity, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM OfflineEntityVersionEntity e WHERE e.entityKey = :entityKey")
    Optional<OfflineEntityVersionEntity> findByEntityKeyForUpdate(@Param("entityKey") String entityKey);

    Optional<OfflineEntityVersionEntity> findByEntityKey(String entityKey);
}
