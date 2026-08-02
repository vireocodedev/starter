import { useFieldArray, type FieldValues, type UseFieldArrayReturn, type UseFormReturn } from "react-hook-form";

type UnwrapArray<T> = T extends (infer U)[] ? U : T;

export function useRgoTypedFieldArray<T extends FieldValues, U = UnwrapArray<T>>(
  form: UseFormReturn<T>,
  path?: string,
  // @ts-expect-error
): UseFieldArrayReturn<{ model: U[] }, "model"> {
  // @ts-expect-error
  return useFieldArray({
    control: form.control,
    // @ts-expect-error
    name: path,
  });
}
