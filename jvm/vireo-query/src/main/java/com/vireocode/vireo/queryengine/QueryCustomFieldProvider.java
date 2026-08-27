package com.vireocode.vireo.queryengine;

import java.util.List;

public interface QueryCustomFieldProvider {
    List<QueryFieldDefinition> getFields();
}