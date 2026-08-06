package com.vireocode.starter.offline;

import java.util.UUID;

public record OfflineActor(
        UUID id,
        String username,
        boolean superadmin) {
}