import { type UseFormReturn } from "@/hooks/useRgoForm/useRgoForm";
import { useCallback } from "react";
import type { FieldArrayPath, FieldPathValue, FieldValues, Path } from "react-hook-form";

export type PathsMatching<TTarget extends FieldValues, TSchema extends FieldValues> = {
  [K in Path<TSchema>]: NonNullable<FieldPathValue<TSchema, K>> extends TTarget ? K : never;
}[Path<TSchema>];

export type ValidFieldArrayPaths<TTarget extends FieldValues, TSchema extends FieldValues> = Extract<
  FieldArrayPath<TSchema>,
  PathsMatching<TTarget, TSchema>
>;

export type FormPathGroup<TTarget extends FieldValues, TSchema extends FieldValues> = TSchema extends TTarget
  ? {
      form: UseFormReturn<TTarget>;
      path: undefined;
    }
  : {
      form: UseFormReturn<TSchema>;
      path: PathsMatching<TTarget, TSchema>;
    };

export type UseFormFieldsReturn<TSchema extends FieldValues> = {
  typedForm: UseFormReturn<TSchema>;
  getPath: <TField extends Path<TSchema>>(field: TField) => TField;
};

export function useRgoTypedForm<TSchema extends FieldValues>(
  form: UseFormReturn<FieldValues> | UseFormReturn<TSchema>,
  path?: string,
): UseFormFieldsReturn<TSchema> {
  const typedForm = form as UseFormReturn<TSchema>;

  const getPath = useCallback(
    <TField extends Path<TSchema>>(field: TField): TField => {
      return (path ? `${path}.${field}` : field) as TField;
    },
    [path],
  );

  return { typedForm, getPath };
}
