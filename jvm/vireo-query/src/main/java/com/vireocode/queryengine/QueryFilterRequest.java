package com.vireocode.queryengine;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.vireocode.spi.QueryFilterCriteria;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QueryFilterRequest(
        String entity,
        String javaType,
        List<QueryFilterRow> rows) implements QueryFilterCriteria {

    public QueryFilterRequest {
        rows = rows == null ? List.of() : List.copyOf(rows);
    }
}
