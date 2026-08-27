package com.vireocode.offline;

import java.util.UUID;

public record OfflineActor(
        UUID id,
        String username,
        boolean privileged) {
}
