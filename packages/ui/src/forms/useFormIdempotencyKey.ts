import React from "react";
import { type FieldValues, type UseFormReturn } from "react-hook-form";

/** Keeps one mutation idempotency key until the form changes after settlement. */
export function useFormIdempotencyKey<TForm extends FieldValues>(form: UseFormReturn<TForm>, mutationPending: boolean) {
  const idempotencyKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const subscription = form.watch(() => {
      if (mutationPending) return;
      idempotencyKeyRef.current = null;
    });

    return subscription.unsubscribe;
  }, [form, mutationPending]);

  return idempotencyKeyRef;
}
