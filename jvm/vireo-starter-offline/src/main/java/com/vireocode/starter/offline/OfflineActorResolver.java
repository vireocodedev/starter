package com.vireocode.starter.offline;

import java.util.Optional;

public interface OfflineActorResolver {

    Optional<OfflineActor> resolveCurrentActor();
}