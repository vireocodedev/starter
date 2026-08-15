import { useFormIdempotencyKey } from "@/forms/useFormIdempotencyKey";
import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

type TestForm = { name: string };

function useHarness(mutationPending: boolean) {
  const form = useForm<TestForm>({ defaultValues: { name: "" } });
  const idempotencyKeyRef = useFormIdempotencyKey(form, mutationPending);
  return { form, idempotencyKeyRef };
}

describe("useFormIdempotencyKey", () => {
  it("retains the key while a mutation is pending and clears it on the next settled edit", () => {
    const { result, rerender } = renderHook(({ mutationPending }) => useHarness(mutationPending), {
      initialProps: { mutationPending: true },
    });
    result.current.idempotencyKeyRef.current = "request-key";

    act(() => result.current.form.setValue("name", "during request"));
    expect(result.current.idempotencyKeyRef.current).toBe("request-key");

    rerender({ mutationPending: false });
    act(() => result.current.form.setValue("name", "after request"));
    expect(result.current.idempotencyKeyRef.current).toBeNull();
  });
});
