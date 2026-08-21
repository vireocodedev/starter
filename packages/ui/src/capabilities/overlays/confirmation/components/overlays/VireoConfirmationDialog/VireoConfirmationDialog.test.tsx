import { Button } from "@mui/material";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { useVireoConfirmation } from "@/capabilities/overlays/confirmation/hooks/useVireoConfirmation/useVireoConfirmation";
import { VireoConfirmationProvider } from "@/capabilities/overlays/confirmation/providers/VireoConfirmationProvider/VireoConfirmationProvider";
import { VireoConfirmationDialog } from "./VireoConfirmationDialog";
import { vireoConfirmationDialogClasses } from "./VireoConfirmationDialog.classes";

describe("VireoConfirmationDialog", () => {
  it("renders safe React content and resolves explicit actions", async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <VireoConfirmationDialog
        open
        title="Delete item?"
        message="This cannot be undone."
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );
    expect(document.querySelector(`.${vireoConfirmationDialogClasses.root}`)).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("disables every exit while loading", () => {
    render(
      <VireoConfirmationDialog
        open
        loading
        title="Working"
        message="Please wait."
        onClose={() => undefined}
        onConfirm={() => undefined}
      />,
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeDisabled();
  });

  it("provides a promise-based confirmation decision", async () => {
    function Consumer() {
      const confirm = useVireoConfirmation();
      const [result, setResult] = React.useState("pending");
      return (
        <>
          <Button
            onClick={async () => setResult(String(await confirm({ title: "Continue?", message: "Review changes." })))}
          >
            Open
          </Button>
          <span>{result}</span>
        </>
      );
    }
    render(
      <VireoConfirmationProvider>
        <Consumer />
      </VireoConfirmationProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(screen.getByText("true")).toBeInTheDocument();
  });
});
