package com.vireocode.vireo.offline;

import java.util.UUID;

public record OfflineActor(
        UUID id,
        String username,
        boolean privileged) {
}
