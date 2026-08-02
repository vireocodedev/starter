import { type UseFormReturn } from "@/hooks/useRgoForm/useRgoForm";
import React from "react";
import type { Path, FieldValues as RhfFieldValues } from "react-hook-form";
import { usePrevious } from "react-use";

/**
 * Hook for revalidating dependent fields in a React Hook Form.
 *
 * This hook monitors a specified set of form fields and triggers revalidation for all the other fields
 * in the set when one of the fields changes, but only after the form has been submitted. This is particularly
 * useful for forms with interdependent values (e.g., validating that a start date is before an end date).
 *
 * @template TFieldValues - The type of the form's field values. It should extend `RhfFieldValues`.
 * @param form - The React Hook Form instance returned by `useRgoForm`.
 * @param fields - A list of field paths (keys) to be monitored. These keys represent the dependent fields that should trigger revalidation on each other when one of them changes.
 * @returns void
 *
 * @example
 * ```tsx
 * import z from "zod";
 * import { useRgoForm } from "@/lib/react-hook-form/hooks/useRgoForm";
 * import { useRgoDependentFieldValidation } from "@/lib/react-hook-form/hooks/useRgoDependentFieldValidation";
 *
 * const FormRequest = z.object({
 *   startDate: z.number().nullable(),
 *   endDate: z.number().nullable(),
 * }).refine(data => !data.endDate || data.endDate >= data.startDate!, {
 *     message: "End date must be after start date",
 *     path: ["endDate"],
 *   });
 *
 * type FormRequest = z.infer<typeof FireRequest>;
 *
 * function MyForm() {
 *   const form = useRgoForm<FormRequest>({
 *     schema: () => FormRequest,
 *     defaultValues: {
 *       startDate: null,
 *       endDate: null,
 *     },
 *   });
 *
 *   // Automatically revalidates the "startDate" and "endDate" fields on change
 *   useRgoDependentFieldValidation(form, "startDate", "endDate");
 *
 *   return (
 *     // ... your form components
 *   );
 * };
 * ```
 *
 * @remarks
 * - The hook uses the `watch` method to subscribe to changes on the specified fields.
 * - It utilizes the `usePrevious` hook from `react-use` to compare current and previous values.
 * - Revalidation is only triggered if the form has been submitted at least once (`formState.isSubmitted` is true).
 * - If a field's value changes, validation is triggered for all the other dependent fields.
 * - The dependency array for the memoized `uniqueFields` is intentionally left empty (with an ESLint disable)
 *   because the `fields` parameter is expected to remain stable across renders.
 */
export function useRgoDependentFieldValidation<TFieldValues extends RhfFieldValues = RhfFieldValues>(
  form: UseFormReturn<TFieldValues>,
  ...fields: Path<TFieldValues>[]
) {
  const { watch, trigger, formState } = form;
  const isSubmitted = formState.isSubmitted;

  /** Disabling exhaustive-deps because `fields` should never change on re-render. */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const uniqueFields = React.useMemo(() => [...new Set(fields)], []);

  const currValues = watch(uniqueFields);
  const prevValues = usePrevious(currValues);

  React.useEffect(() => {
    // Ignore first render
    if (!prevValues) return;

    // Ignore if form has not been submitted
    if (!isSubmitted) return;

    // Find fields that have changed
    const changedFields = uniqueFields.filter(key => {
      const keyIndex = uniqueFields.indexOf(key);
      return prevValues[keyIndex] !== currValues[keyIndex];
    });

    // If any field has changed, trigger validation for all other fields
    if (changedFields.length) {
      const fieldsToValidate = uniqueFields.filter(key => !changedFields.includes(key));
      if (fieldsToValidate.length) {
        trigger(fieldsToValidate);
      }
    }
  }, [prevValues, currValues, trigger, uniqueFields, isSubmitted]);
}
