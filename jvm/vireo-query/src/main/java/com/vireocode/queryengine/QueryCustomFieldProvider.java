package com.vireocode.queryengine;

import java.util.List;

public interface QueryCustomFieldProvider {
    List<QueryFieldDefinition> getFields();
}