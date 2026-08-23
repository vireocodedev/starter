package com.vireocode.starter.history;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HistoryRepository extends JpaRepository<HistoryEntry, java.util.UUID> {

    List<HistoryEntry> findByEntityAndEntityIdOrderByOccurredAtDescIdDesc(String entity, String entityId,
            Pageable pageable);
}
