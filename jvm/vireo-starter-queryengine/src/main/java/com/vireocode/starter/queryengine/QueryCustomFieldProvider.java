package com.vireocode.starter.queryengine;

import java.util.List;

public interface QueryCustomFieldProvider {
    List<QueryFieldDefinition> getFields();
}