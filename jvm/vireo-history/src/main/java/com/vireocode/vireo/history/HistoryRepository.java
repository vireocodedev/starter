package com.vireocode.vireo.history;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

interface HistoryRepository extends JpaRepository<HistoryEntry, java.util.UUID> {

    List<HistoryEntry> findByEntityAndEntityIdOrderByOccurredAtDescIdDesc(String entity, String entityId,
            Pageable pageable);
}
