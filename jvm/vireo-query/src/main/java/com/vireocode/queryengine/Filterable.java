package com.vireocode.queryengine;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface Filterable {
    String label() default "";

    QueryOperator[] operators() default {};

    RelationFilterMode relationMode() default RelationFilterMode.CHILD;

    String[] relationSelectionLabelFields() default {};

    boolean multiple() default true;

    boolean expand() default false;

    int maxDepth() default 1;
}