package com.vireocode.starter.queryengine;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QueryFilterRelationOption(String value, String label) {
}
