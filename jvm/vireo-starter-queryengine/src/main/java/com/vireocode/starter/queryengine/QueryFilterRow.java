package com.vireocode.starter.queryengine;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QueryFilterRow(
        String kind,
        String path,
        QueryOperator operator,
        String value,
        boolean parameterized,
        List<QueryFilterRelationOption> selectedOptions) {

    public QueryFilterRow {
        selectedOptions = selectedOptions == null ? List.of() : List.copyOf(selectedOptions);
    }
}
