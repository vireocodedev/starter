package com.vireocode.vireo.offline;

import java.util.Optional;

public interface OfflineActorResolver {

    Optional<OfflineActor> resolveCurrentActor();
}