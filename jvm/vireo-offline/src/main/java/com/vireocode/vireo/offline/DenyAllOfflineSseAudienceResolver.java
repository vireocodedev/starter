package com.vireocode.vireo.offline;

import java.util.Optional;

/** Fail-closed resolver installed until an application declares its SSE audience boundary. */
final class DenyAllOfflineSseAudienceResolver implements OfflineSseAudienceResolver {

    @Override
    public Optional<String> resolveCurrentAudience() {
        return Optional.empty();
    }
}
