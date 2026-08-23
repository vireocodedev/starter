package com.vireocode.starter.queryengine;

import java.util.List;

public record QueryFieldDefinition(
        String path,
        String label,
        QueryFieldType type,
        String enumType,
        List<String> enumValues,
        List<QueryOperator> operators,
        boolean relation,
        String relationEntityKey,
        RelationFilterMode relationMode,
        boolean multiple,
        List<String> relationSelectionLabelFields,
        boolean expandable,
        int maxDepth,
        List<QueryFieldDefinition> children) {

    public QueryFieldDefinition {
        enumValues = enumValues == null ? List.of() : List.copyOf(enumValues);
        operators = operators == null ? List.of() : List.copyOf(operators);
        relationSelectionLabelFields = relationSelectionLabelFields == null
                ? List.of()
                : List.copyOf(relationSelectionLabelFields);
        children = children == null ? List.of() : List.copyOf(children);
    }
}
