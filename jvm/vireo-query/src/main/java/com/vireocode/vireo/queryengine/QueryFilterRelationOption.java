package com.vireocode.vireo.queryengine;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record QueryFilterRelationOption(String value, String label) {
}
