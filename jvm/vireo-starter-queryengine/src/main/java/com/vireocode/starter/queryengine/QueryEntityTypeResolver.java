package com.vireocode.starter.queryengine;

import java.util.Map;

public interface QueryEntityTypeResolver {

    Map<QueryEntityKey, Class<?>> entityTypes();
}
