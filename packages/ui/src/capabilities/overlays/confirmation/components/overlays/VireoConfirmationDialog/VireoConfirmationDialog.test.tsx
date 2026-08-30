import { Button } from "@mui/material";
import { render, screen, waitForElementToBeRemoved } from "@testing-library/react";
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
    expect(screen.getByRole("dialog", { name: "Delete item?" })).toBeInTheDocument();
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
    const confirm = screen.getByRole("button", { name: "Confirm" });
    expect(confirm).toBeDisabled();
    expect(confirm).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
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
    const message = screen.getByText("Review changes.");
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(screen.getByText("true")).toBeInTheDocument();
    expect(message).toBeInTheDocument();
    await waitForElementToBeRemoved(message);
  });

  it("keeps provider confirmation context visible and locked while an async action runs", async () => {
    let finishAction: (() => void) | undefined;
    const action = vi.fn(() => new Promise<void>(resolve => (finishAction = resolve)));

    function Consumer() {
      const confirm = useVireoConfirmation();
      const [result, setResult] = React.useState("pending");
      return (
        <>
          <Button
            onClick={async () =>
              setResult(
                String(
                  await confirm({
                    title: "Delete account?",
                    message: "Northstar Analytics",
                    confirmLabel: "Delete",
                    confirmColor: "error",
                    onConfirm: action,
                  }),
                ),
              )
            }
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
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(action).toHaveBeenCalledOnce();
    expect(screen.getByText("Northstar Analytics")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    expect(screen.getByText("pending")).toBeInTheDocument();

    finishAction?.();
    await waitForElementToBeRemoved(() => screen.queryByText("Northstar Analytics"));
    expect(screen.getByText("true")).toBeInTheDocument();
  });

  it("keeps a rejected provider action open and enables retry", async () => {
    const action = vi.fn().mockRejectedValueOnce(new Error("Request failed")).mockResolvedValueOnce(undefined);

    function Consumer() {
      const confirm = useVireoConfirmation();
      return (
        <Button
          onClick={() =>
            void confirm({
              title: "Archive account?",
              message: "Northstar Analytics",
              confirmLabel: "Archive",
              onConfirm: action,
            })
          }
        >
          Open
        </Button>
      );
    }

    render(
      <VireoConfirmationProvider>
        <Consumer />
      </VireoConfirmationProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await userEvent.click(screen.getByRole("button", { name: "Archive" }));

    expect(await screen.findByRole("button", { name: "Archive" })).toBeEnabled();
    expect(screen.getByText("Northstar Analytics")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Archive" }));
    expect(action).toHaveBeenCalledTimes(2);
    await waitForElementToBeRemoved(() => screen.queryByText("Northstar Analytics"));
  });
});
