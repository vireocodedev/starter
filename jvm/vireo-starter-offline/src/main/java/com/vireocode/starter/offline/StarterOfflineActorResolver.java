package com.vireocode.starter.offline;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.vireocode.starter.auth.StarterUserDetails;
import com.vireocode.starter.web.RestUtils;

/**
 * Resolves the offline actor from the starter's default user model.
 *
 * <p>
 * This lives in the offline module rather than in {@code vireo-starter-auth}
 * because it is the adapter between the two, and offline already sits above
 * auth in the module graph. A consumer with its own user model supplies its own
 * {@link OfflineActorResolver} and this default backs off.
 *
 * <p>
 * The privileged role is a property rather than a constant: the starter has no
 * opinion on what an application calls its administrators.
 */
@Component
public class StarterOfflineActorResolver implements OfflineActorResolver {

    private final String privilegedRole;

    public StarterOfflineActorResolver(
            @Value("${vireo.starter.offline.privileged-role:SUPERADMIN}") String privilegedRole) {
        this.privilegedRole = privilegedRole;
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
