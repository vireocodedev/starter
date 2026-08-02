import { type RgoTranslationFn } from "@/setup/config/RgoLocale";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import {
  useForm as useRhfForm,
  type FieldValues as RhfFieldValues,
  type Path,
  type UseFormProps as UseRhfFormProps,
  type UseFormReturn as UseRhfFormReturn,
} from "react-hook-form";
import { usePrevious } from "react-use";
import { type z } from "zod";

export type ZodSchemaType<TFieldValues extends RhfFieldValues = RhfFieldValues, TTranslationFn = RgoTranslationFn> = (
  t: TTranslationFn,
) => z.ZodType<TFieldValues>;

export type UseFormSchema<TFieldValues extends RhfFieldValues = RhfFieldValues, TTranslationFn = RgoTranslationFn> = (
  t: TTranslationFn,
) => z.ZodType<TFieldValues>;

export type UseFormProps<
  TFieldValues extends RhfFieldValues = RhfFieldValues,
  TTranslationFn = RgoTranslationFn,
> = Omit<UseRhfFormProps<TFieldValues>, "resolver"> & {
  defaultValues: UseRhfFormProps<TFieldValues>["defaultValues"];
  schema?: UseFormSchema<TFieldValues, TTranslationFn>;
  t: TTranslationFn;
  /**
   * Field paths that depend on each other for validation. When any of these
   * fields changes (after the form has been submitted at least once), the
   * other listed fields are re-validated.
   *
   * Use this for cross-field rules (e.g. `endTime >= startTime`,
   * `closingTime` requires `closingComment`) without manually wiring a
   * separate `useRgoDependentFieldValidation` call.
   *
   * The array is read once on mount and is expected to be stable across
   * renders (declare it as a literal in the component body).
   *
   * For forms with multiple independent dependency groups, call
   * {@link useRgoDependentFieldValidation} directly for the additional groups.
   */
  revalidateOnChange?: Path<TFieldValues>[];
};

export type UseFormReturn<TFieldValues extends RhfFieldValues = RhfFieldValues> = UseRhfFormReturn<TFieldValues> & {
  submitDisabled: boolean;
};

export function useRgoForm<TFieldValues extends RhfFieldValues = RhfFieldValues, TTranslationFn = RgoTranslationFn>({
  schema,
  t,
  revalidateOnChange,
  ...props
}: UseFormProps<TFieldValues, TTranslationFn>): UseFormReturn<TFieldValues> {
  const resolver = React.useMemo(() => {
    return schema ? zodResolver(schema(t)) : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const form = useRhfForm<TFieldValues>({
    ...props,
    resolver,
  });

  const submitDisabled = form.formState.isSubmitting || (form.formState.isSubmitted && !form.formState.isValid);
  // @ts-expect-error - augmenting form return type with custom property
  form.submitDisabled = submitDisabled;

  // Cross-field revalidation. Mirrors `useRgoDependentFieldValidation` but
  // inlined so we can call exactly one `watch`/`useEffect` regardless of
  // whether `revalidateOnChange` is provided. The fields list is captured
  // once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fields = React.useMemo(() => [...new Set(revalidateOnChange ?? [])], []);
  const watchedValues = form.watch(fields);
  const prevWatchedValues = usePrevious(watchedValues);
  const isSubmitted = form.formState.isSubmitted;
  React.useEffect(() => {
    if (fields.length === 0) return;
    if (!prevWatchedValues) return;
    if (!isSubmitted) return;

    const changedFields = fields.filter((_, i) => prevWatchedValues[i] !== watchedValues[i]);
    if (changedFields.length === 0) return;

    const fieldsToValidate = fields.filter(f => !changedFields.includes(f));
    if (fieldsToValidate.length > 0) {
      form.trigger(fieldsToValidate);
    }
  }, [prevWatchedValues, watchedValues, fields, isSubmitted, form]);

  return form as UseFormReturn<TFieldValues>;
}
