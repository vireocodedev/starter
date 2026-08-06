package com.vireocode.starter.offline;

import java.time.Instant;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.vireocode.starter.spi.OfflineRevisionTracker;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OfflineEntityVersionService implements OfflineRevisionTracker {

    private final OfflineEntityVersionRepository repository;

    public OfflineEntityVersionService(OfflineEntityVersionRepository repository) {
        this.repository = repository;
    }

    @Transactional
    @Override
    public long bump(String entityKey) {
        String normalizedEntityKey = normalizeEntityKey(entityKey);
        if (normalizedEntityKey == null) {
            return 0L;
        }

        for (int attempt = 0; attempt < 3; attempt++) {
            try {
                OfflineEntityVersionEntity state = repository.findByEntityKeyForUpdate(normalizedEntityKey)
                        .orElseGet(() -> {
                            OfflineEntityVersionEntity created = new OfflineEntityVersionEntity();
                            created.setEntityKey(normalizedEntityKey);
                            created.setRevision(0L);
                            return created;
                        });

                state.setRevision(state.getRevision() + 1);
                state.setChangedAt(Instant.now());
                repository.saveAndFlush(state);
                return state.getRevision();
            } catch (DataIntegrityViolationException ex) {
                if (attempt == 2) {
                    throw ex;
                }
            }
        }

        throw new IllegalStateException("Could not bump offline entity revision");
    }

    @Transactional(readOnly = true)
    public List<OfflineHydrationEntityVersionDto> getVersions(List<String> entityKeys) {
        if (entityKeys == null || entityKeys.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, OfflineHydrationEntityVersionDto> versionsByEntity = new LinkedHashMap<>();

        for (String entityKey : entityKeys) {
            String normalizedEntityKey = normalizeEntityKey(entityKey);
            if (normalizedEntityKey == null || versionsByEntity.containsKey(normalizedEntityKey)) {
                continue;
            }

            OfflineHydrationEntityVersionDto dto = repository.findByEntityKey(normalizedEntityKey)
                    .map(entity -> new OfflineHydrationEntityVersionDto(entity.getEntityKey(), entity.getRevision(),
                            entity.getChangedAt()))
                    .orElseGet(() -> new OfflineHydrationEntityVersionDto(normalizedEntityKey, 0L, null));

            versionsByEntity.put(normalizedEntityKey, dto);
        }

        return versionsByEntity.values().stream().toList();
    }

    public OfflineHydrationVersionsResponseDto getVersionSnapshot(List<String> entityKeys) {
        return new OfflineHydrationVersionsResponseDto(Instant.now(), getVersions(entityKeys));
    }

    private String normalizeEntityKey(String entityKey) {
        if (entityKey == null || entityKey.isBlank()) {
            return null;
        }

        return entityKey.trim();
    }
}
