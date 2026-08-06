package com.vireocode.starter.web;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import com.fasterxml.jackson.annotation.JacksonAnnotationsInside;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;

/**
 * Marks a DTO field as output-only: it is serialized in responses but ignored
 * in request bodies. Use it for backend-generated or computed "frontend
 * convenience" values (identifiers, display labels, snapshots, computed totals)
 * that the client never sends back.
 *
 * <p>
 * This is why the frontend upsert payloads omit these fields entirely — the
 * backend would discard them on input anyway.
 */
@JacksonAnnotationsInside
@JsonProperty(access = Access.READ_ONLY)
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface OutputOnly {
}
