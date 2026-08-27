package com.vireocode.queryengine;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QueryFilterNode(
        String kind,
        String path,
        QueryOperator operator,
        String value,
        boolean parameterized,
        List<QueryFilterRelationOption> selectedOptions,
        List<QueryFilterNode> children) {

    public QueryFilterNode {
        selectedOptions = selectedOptions == null ? List.of() : List.copyOf(selectedOptions);
        children = children == null ? List.of() : List.copyOf(children);
    }
}
