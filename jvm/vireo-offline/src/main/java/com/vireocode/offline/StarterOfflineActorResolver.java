package com.vireocode.offline;

import java.util.Optional;

import com.vireocode.auth.StarterUserDetails;
import com.vireocode.web.RestUtils;

/**
 * Resolves the offline actor from the starter's default user model.
 *
 * <p>
 * This lives in the offline module rather than in {@code vireo-auth}
 * because it is the adapter between the two, and offline already sits above
 * auth in the module graph. A consumer with its own user model supplies its own
 * {@link OfflineActorResolver} and this default backs off.
 *
 * <p>
 * The privileged role is a property rather than a constant: the starter has no
 * opinion on what an application calls its administrators.
 */
public class StarterOfflineActorResolver implements OfflineActorResolver {

    private final String privilegedRole;

    public StarterOfflineActorResolver(
            String privilegedRole) {
        if (privilegedRole == null || privilegedRole.isBlank()) {
            throw new IllegalArgumentException("privilegedRole must not be blank");
        }
        this.privilegedRole = privilegedRole.trim();
    }

    @Override
    public Optional<OfflineActor> resolveCurrentActor() {
        return RestUtils.getCurrentPrincipal(StarterUserDetails.class)
                .map(user -> new OfflineActor(
                        user.getId(),
                        user.getUsername(),
                        privilegedRole.equals(user.getRole())));
    }
}
