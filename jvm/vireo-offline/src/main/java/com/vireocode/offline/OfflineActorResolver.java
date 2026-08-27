package com.vireocode.offline;

import java.util.Optional;

public interface OfflineActorResolver {

    Optional<OfflineActor> resolveCurrentActor();
}