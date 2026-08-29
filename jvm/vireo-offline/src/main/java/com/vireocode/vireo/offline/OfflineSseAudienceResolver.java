package com.vireocode.vireo.offline;

import java.util.Optional;

/**
 * Resolves the opaque audience shared by an SSE connection and the changes it may receive.
 *
 * <p>The application decides whether the audience represents one subject, tenant, organization, or another isolation
 * boundary. Empty means that payload streaming is not authorized in the current context.
 */
@FunctionalInterface
public interface OfflineSseAudienceResolver {

    Optional<String> resolveCurrentAudience();
}
