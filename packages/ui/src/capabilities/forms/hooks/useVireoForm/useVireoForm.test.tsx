import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useVireoForm } from "./useVireoForm";

describe("useVireoForm", () => {
  it("preserves the native TanStack API while exposing only the Vireo façades", () => {
    const { result } = renderHook(() => useVireoForm({ defaultValues: { name: "" } }));
    const form = result.current;

    expect(form.Field).toBeTypeOf("function");
    expect(form.Form).toBeTypeOf("object");
    expect(form.Actions).toBeTypeOf("object");
    expect("ResetButton" in form).toBe(false);
    expect(form.Section).toBeTypeOf("object");
    expect(form.SectionItem).toBeTypeOf("object");
    expect(form.SubmitButton).toBeTypeOf("object");
    expect(form.handleSubmit).toBeTypeOf("function");
    expect("AppField" in form).toBe(false);
    expect("AppForm" in form).toBe(false);
    expect(Object.keys(form)).not.toContain("AppField");
    expect(Object.keys(form)).not.toContain("AppForm");
  });
});
