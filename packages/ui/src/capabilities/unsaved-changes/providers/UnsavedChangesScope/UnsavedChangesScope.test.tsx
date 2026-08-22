import { UnsavedChangesScope } from "./UnsavedChangesScope";
import { useUnsavedChangesScopeId } from "@/capabilities/unsaved-changes/contexts/UnsavedChangesContext/UnsavedChangesContext";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

function ScopeId({ name }: { name: string }) {
  return <output aria-label={name}>{useUnsavedChangesScopeId() ?? "unscoped"}</output>;
}

describe("UnsavedChangesScope", () => {
  it("composes explicit nested scope identifiers", () => {
    render(
      <UnsavedChangesScope id="invoice">
        <ScopeId name="invoice" />
        <UnsavedChangesScope id="items">
          <ScopeId name="items" />
        </UnsavedChangesScope>
      </UnsavedChangesScope>,
    );

    expect(screen.getByLabelText("invoice")).toHaveTextContent("invoice");
    expect(screen.getByLabelText("items")).toHaveTextContent("invoice/items");
  });

  it("generates a stable normalized identifier when one is not supplied", () => {
    const { rerender } = render(
      <UnsavedChangesScope>
        <ScopeId name="generated" />
      </UnsavedChangesScope>,
    );
    const scopeId = screen.getByLabelText("generated").textContent;

    expect(scopeId).toMatch(/^scope-[^:]+$/);
    rerender(
      <UnsavedChangesScope>
        <ScopeId name="generated" />
      </UnsavedChangesScope>,
    );
    expect(screen.getByLabelText("generated")).toHaveTextContent(scopeId ?? "");
  });
});
