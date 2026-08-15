import { OverlayHistoryBridge } from "@/overlay-history/OverlayHistoryBridge";
import { readOverlayStack } from "@/overlay-history/overlayHistory.machine";
import { resetOverlayHistoryEntries } from "@/overlay-history/overlayHistory.store";
import { useOverlayBackClose } from "@/overlay-history/useOverlayBackClose";
import { UnsavedChangesRouterProvider } from "@/unsaved-changes/UnsavedChangesRouterProvider";
import {
  UnsavedChangesScope,
  useUnsavedChangesRegistration,
  useUnsavedChangesRequestDiscard,
} from "@vireocodedev/starter-ui";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";

type TestRouter = ReturnType<typeof createMemoryRouter>;

function Prompt({ onDiscard, onStay, open }: { onDiscard: () => void; onStay: () => void; open: boolean }) {
  if (!open) return null;

  return (
    <div aria-label="Unsaved changes" role="dialog">
      <button type="button" onClick={onStay}>
        Stay
      </button>
      <button type="button" onClick={onDiscard}>
        Discard
      </button>
    </div>
  );
}

type TestOverlayProps = {
  dirty: boolean;
  onClose: () => void;
  open: boolean;
};

function TestOverlayContent({ dirty, onClose, open }: TestOverlayProps) {
  useUnsavedChangesRegistration({ dirty: dirty && open });
  const requestClose = useUnsavedChangesRequestDiscard(onClose);
  useOverlayBackClose({ open, onRequestClose: requestClose });

  return open ? (
    <div aria-label="Overlay" role="dialog">
      <button type="button" onClick={requestClose}>
        Close overlay
      </button>
      <SubScreen />
    </div>
  ) : null;
}

const subScreenState = { enabled: false };

function SubScreen() {
  const [open, setOpen] = React.useState(false);
  useOverlayBackClose({ open, onRequestClose: () => setOpen(false) });

  if (!subScreenState.enabled) return null;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open sub screen
      </button>
      {open ? <p>Sub screen</p> : null}
    </>
  );
}

function TestOverlay(props: TestOverlayProps) {
  return (
    <UnsavedChangesScope>
      <TestOverlayContent {...props} />
    </UnsavedChangesScope>
  );
}

const overlayState = { dirty: false };

function TestPage() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <h1>Table page</h1>
      <button type="button" onClick={() => setOpen(true)}>
        Open overlay
      </button>
      <TestOverlay open={open} dirty={overlayState.dirty} onClose={() => setOpen(false)} />
    </>
  );
}

function TestRoot() {
  return (
    <UnsavedChangesRouterProvider renderPrompt={props => <Prompt {...props} />}>
      <OverlayHistoryBridge />
      <Outlet />
    </UnsavedChangesRouterProvider>
  );
}

function renderApp(): TestRouter {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: <TestRoot />,
        children: [
          { path: "previous", element: <h1>Previous page</h1> },
          { path: "table", element: <TestPage /> },
        ],
      },
    ],
    { initialEntries: ["/previous", "/table"], initialIndex: 1 },
  );

  render(<RouterProvider router={router} />);
  return router;
}

async function goBack(router: TestRouter): Promise<void> {
  await act(async () => {
    await router.navigate(-1);
  });
}

async function openOverlay(router: TestRouter): Promise<void> {
  fireEvent.click(screen.getByRole("button", { name: "Open overlay" }));
  await waitFor(() => expect(readOverlayStack(router.state.location.state)).toHaveLength(1));
}

describe("useOverlayBackClose", () => {
  beforeEach(() => {
    overlayState.dirty = false;
    subScreenState.enabled = false;
    resetOverlayHistoryEntries();
  });

  it("pushes a same-URL history entry while the overlay is open", async () => {
    const router = renderApp();
    await openOverlay(router);

    expect(router.state.location.pathname).toBe("/table");
    expect(screen.getByRole("dialog", { name: "Overlay" })).toBeInTheDocument();
  });

  it("closes only the overlay on back and leaves the route untouched", async () => {
    const router = renderApp();
    await openOverlay(router);
    await goBack(router);

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Overlay" })).not.toBeInTheDocument());
    expect(router.state.location.pathname).toBe("/table");
    expect(readOverlayStack(router.state.location.state)).toEqual([]);
  });

  it("navigates the route on the next back press after closing", async () => {
    const router = renderApp();
    await openOverlay(router);
    await goBack(router);
    await waitFor(() => expect(readOverlayStack(router.state.location.state)).toEqual([]));
    await goBack(router);

    await waitFor(() => expect(router.state.location.pathname).toBe("/previous"));
  });

  it("consumes the synthetic entry after a control closes the overlay", async () => {
    const router = renderApp();
    await openOverlay(router);
    fireEvent.click(screen.getByRole("button", { name: "Close overlay" }));
    await waitFor(() => expect(readOverlayStack(router.state.location.state)).toEqual([]));
    await goBack(router);

    await waitFor(() => expect(router.state.location.pathname).toBe("/previous"));
  });

  it("restores the history entry when a dirty overlay stays open", async () => {
    overlayState.dirty = true;
    const router = renderApp();
    await openOverlay(router);
    await goBack(router);

    expect(await screen.findByRole("dialog", { name: "Unsaved changes" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Stay" }));
    await waitFor(() => expect(readOverlayStack(router.state.location.state)).toHaveLength(1));
  });

  it("closes the dirty overlay when discard is confirmed", async () => {
    overlayState.dirty = true;
    const router = renderApp();
    await openOverlay(router);
    await goBack(router);
    fireEvent.click(await screen.findByRole("button", { name: "Discard" }));

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Overlay" })).not.toBeInTheDocument());
    expect(router.state.location.pathname).toBe("/table");
  });

  it("dismisses stacked layers one at a time", async () => {
    subScreenState.enabled = true;
    const router = renderApp();
    await openOverlay(router);
    fireEvent.click(screen.getByRole("button", { name: "Open sub screen" }));
    await waitFor(() => expect(readOverlayStack(router.state.location.state)).toHaveLength(2));

    await goBack(router);
    await waitFor(() => expect(screen.queryByText("Sub screen")).not.toBeInTheDocument());
    expect(screen.getByRole("dialog", { name: "Overlay" })).toBeInTheDocument();
    await waitFor(() => expect(readOverlayStack(router.state.location.state)).toHaveLength(1));

    await goBack(router);
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Overlay" })).not.toBeInTheDocument());
  });
});
