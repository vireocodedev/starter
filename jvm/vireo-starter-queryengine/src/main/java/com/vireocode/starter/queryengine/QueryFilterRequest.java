package com.vireocode.starter.queryengine;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.vireocode.starter.spi.QueryFilterCriteria;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QueryFilterRequest(
        String entity,
        String javaType,
        List<QueryFilterRow> rows) implements QueryFilterCriteria {
}
