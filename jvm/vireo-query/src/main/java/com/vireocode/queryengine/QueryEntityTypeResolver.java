package com.vireocode.queryengine;

import java.util.Map;

public interface QueryEntityTypeResolver {

    Map<QueryEntityKey, Class<?>> entityTypes();
}
