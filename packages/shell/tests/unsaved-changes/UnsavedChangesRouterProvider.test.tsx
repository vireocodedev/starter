import {
  UnsavedChangesRouterProvider,
  type UnsavedChangesPromptRenderProps,
} from "@/unsaved-changes/UnsavedChangesRouterProvider";
import {
  UnsavedChangesScope,
  useUnsavedChangesRegistration,
  useUnsavedChangesRequestDiscard,
} from "@vireocodedev/starter-ui";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { createMemoryRouter, Outlet, RouterProvider, useNavigate } from "react-router";
import { describe, expect, it, vi } from "vitest";

function Prompt({ busy, discarding, onDiscard, onStay, open }: UnsavedChangesPromptRenderProps) {
  if (!open) return null;

  return (
    <div aria-label="Unsaved changes" role="dialog">
      <span>{busy ? "Busy" : discarding ? "Discarding" : "Ready"}</span>
      <button type="button" onClick={onStay}>
        Stay
      </button>
      {!busy ? (
        <button type="button" onClick={onDiscard}>
          Discard
        </button>
      ) : null}
    </div>
  );
}

function DirtyRegistration({ busy = false, dirty = true }: { busy?: boolean; dirty?: boolean }) {
  useUnsavedChangesRegistration({ busy, dirty });
  return null;
}

function NavigationPage() {
  const navigate = useNavigate();

  return (
    <>
      <DirtyRegistration />
      <button type="button" onClick={() => navigate("/next")}>
        Next
      </button>
      <button type="button" onClick={() => navigate("/login")}>
        Login
      </button>
    </>
  );
}

function renderRouter({
  element,
  shouldBypassNavigation,
}: {
  element: React.ReactNode;
  shouldBypassNavigation?: React.ComponentProps<typeof UnsavedChangesRouterProvider>["shouldBypassNavigation"];
}) {
  const router = createMemoryRouter(
    [
      {
        element: (
          <UnsavedChangesRouterProvider
            renderPrompt={props => <Prompt {...props} />}
            shouldBypassNavigation={shouldBypassNavigation}
          >
            <Outlet />
          </UnsavedChangesRouterProvider>
        ),
        children: [
          { path: "/", element },
          { path: "/next", element: <p>Next page</p> },
          { path: "/login", element: <p>Login page</p> },
        ],
      },
    ],
    { initialEntries: ["/"] },
  );

  render(<RouterProvider router={router} />);
  return router;
}

function ScopeCloseButton({ onClose }: { onClose: () => void }) {
  const requestClose = useUnsavedChangesRequestDiscard(onClose);
  return (
    <button type="button" onClick={requestClose}>
      Close
    </button>
  );
}

describe("UnsavedChangesRouterProvider", () => {
  it("blocks changed-location navigation and supports staying or discarding", async () => {
    const router = renderRouter({ element: <NavigationPage /> });

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByRole("dialog", { name: "Unsaved changes" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");

    fireEvent.click(screen.getByRole("button", { name: "Stay" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(router.state.location.pathname).toBe("/");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(await screen.findByRole("button", { name: "Discard" }));
    await screen.findByText("Next page");
    expect(router.state.location.pathname).toBe("/next");
  });

  it("installs the unload guard only while dirty data exists", async () => {
    function Harness() {
      const [dirty, setDirty] = React.useState(true);
      return (
        <>
          <DirtyRegistration dirty={dirty} />
          <button type="button" onClick={() => setDirty(false)}>
            Mark clean
          </button>
        </>
      );
    }

    renderRouter({ element: <Harness /> });
    await waitFor(() => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    fireEvent.click(screen.getByRole("button", { name: "Mark clean" }));
    await waitFor(() => {
      const event = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });
  });

  it("honors injected navigation-bypass policy", async () => {
    const shouldBypassNavigation = vi.fn(({ nextLocation }) => nextLocation.pathname === "/login");
    const router = renderRouter({ element: <NavigationPage />, shouldBypassNavigation });

    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    await screen.findByText("Login page");

    expect(router.state.location.pathname).toBe("/login");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(shouldBypassNavigation).toHaveBeenCalled();
  });

  it("prevents scoped discard while a dirty registration is busy", async () => {
    const close = vi.fn();

    function Harness() {
      const [busy, setBusy] = React.useState(true);
      return (
        <UnsavedChangesScope>
          <DirtyRegistration busy={busy} />
          <ScopeCloseButton onClose={close} />
          <button type="button" onClick={() => setBusy(false)}>
            Finish saving
          </button>
        </UnsavedChangesScope>
      );
    }

    renderRouter({ element: <Harness /> });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(await screen.findByText("Busy")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Discard" })).not.toBeInTheDocument();
    expect(close).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Finish saving" }));
    fireEvent.click(await screen.findByRole("button", { name: "Discard" }));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
  });
});
