import { createFormHookContexts } from "@tanstack/react-form";

export const {
  fieldContext: vireoFieldContext,
  formContext: vireoTanStackFormContext,
  useFieldContext: useVireoFieldContext,
  useFormContext: useVireoTanStackFormContext,
} = createFormHookContexts();
