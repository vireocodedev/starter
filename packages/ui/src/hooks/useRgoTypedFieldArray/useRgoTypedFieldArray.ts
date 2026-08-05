import {
  useFieldArray,
  type FieldArrayPath,
  type FieldValues,
  type UseFieldArrayReturn,
  type UseFormReturn,
} from "react-hook-form";

type UnwrapArray<T> = T extends (infer U)[] ? U : T;

/**
 * The name argument is written as `Extract<FieldArrayPath<...>, "model">` rather
 * than as the literal `"model"`.
 *
 * `UseFieldArrayReturn` constrains its second parameter to `FieldArrayPath` of
 * the first, and that constraint stays deferred while `U` is generic, so a bare
 * `"model"` cannot be proven to satisfy it. This spelling satisfies the
 * constraint by construction and still collapses to `"model"` once `U` is known.
 *
 * The previous form leaned on a `@ts-expect-error` above the return annotation.
 * Suppressions do not travel into the emitted `.d.ts`, so the error stayed live
 * for every consumer compiling with `skipLibCheck: false` while staying
 * invisible here.
 */
export function useRgoTypedFieldArray<
  T extends FieldValues,
  U extends FieldValues = UnwrapArray<T> extends FieldValues ? UnwrapArray<T> : FieldValues,
>(
  form: UseFormReturn<T>,
  path?: string,
): UseFieldArrayReturn<{ model: U[] }, Extract<FieldArrayPath<{ model: U[] }>, "model">> {
  // @ts-expect-error
  return useFieldArray({
    control: form.control,
    // @ts-expect-error
    name: path,
  });
}
