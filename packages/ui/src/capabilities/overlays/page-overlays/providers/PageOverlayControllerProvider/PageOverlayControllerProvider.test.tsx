import { PageOverlay, PageOverlayControllerProvider, PageOverlayOutlet } from "./PageOverlayControllerProvider";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

function OverlayHarness({
  firstOpen,
  onCloseFirst,
  onCloseSecond,
  secondOpen,
}: {
  firstOpen: boolean;
  onCloseFirst: () => void;
  onCloseSecond: () => void;
  secondOpen: boolean;
}) {
  return (
    <PageOverlayControllerProvider>
      <PageOverlay
        overlayKey="first"
        open={firstOpen}
        onRequestClose={onCloseFirst}
        render={firstOpen ? <div>First overlay</div> : null}
      />
      <PageOverlay
        overlayKey="second"
        open={secondOpen}
        onRequestClose={onCloseSecond}
        render={secondOpen ? <div>Second overlay</div> : null}
      />
      <PageOverlayOutlet />
    </PageOverlayControllerProvider>
  );
}

describe("PageOverlayController", () => {
  it("portals content into the shared outlet and closes the previous overlay on an opening transition", async () => {
    const onCloseFirst = vi.fn();
    const onCloseSecond = vi.fn();
    const { rerender } = render(
      <OverlayHarness firstOpen secondOpen={false} onCloseFirst={onCloseFirst} onCloseSecond={onCloseSecond} />,
    );

    expect(await screen.findByText("First overlay")).toBeInTheDocument();
    expect(onCloseFirst).not.toHaveBeenCalled();

    rerender(<OverlayHarness firstOpen={false} secondOpen onCloseFirst={onCloseFirst} onCloseSecond={onCloseSecond} />);

    expect(await screen.findByText("Second overlay")).toBeInTheDocument();
    await waitFor(() => expect(onCloseFirst).toHaveBeenCalledOnce());
    expect(onCloseSecond).not.toHaveBeenCalled();
  });

  it("requests exclusivity only when an overlay changes from closed to open", async () => {
    const onCloseFirst = vi.fn();
    const onCloseSecond = vi.fn();
    const { rerender } = render(
      <OverlayHarness firstOpen={false} secondOpen={false} onCloseFirst={onCloseFirst} onCloseSecond={onCloseSecond} />,
    );

    rerender(<OverlayHarness firstOpen secondOpen={false} onCloseFirst={onCloseFirst} onCloseSecond={onCloseSecond} />);
    await waitFor(() => expect(onCloseSecond).toHaveBeenCalledOnce());

    rerender(<OverlayHarness firstOpen secondOpen={false} onCloseFirst={onCloseFirst} onCloseSecond={onCloseSecond} />);
    expect(onCloseSecond).toHaveBeenCalledOnce();

    rerender(
      <OverlayHarness firstOpen={false} secondOpen={false} onCloseFirst={onCloseFirst} onCloseSecond={onCloseSecond} />,
    );
    rerender(<OverlayHarness firstOpen secondOpen={false} onCloseFirst={onCloseFirst} onCloseSecond={onCloseSecond} />);
    await waitFor(() => expect(onCloseSecond).toHaveBeenCalledTimes(2));
  });

  it("unregisters an overlay when it unmounts", async () => {
    const onCloseFirst = vi.fn();
    const onCloseSecond = vi.fn();
    const { rerender } = render(
      <PageOverlayControllerProvider>
        <PageOverlay overlayKey="first" open={false} onRequestClose={onCloseFirst} render={null} />
        <PageOverlay overlayKey="second" open={false} onRequestClose={onCloseSecond} render={null} />
        <PageOverlayOutlet />
      </PageOverlayControllerProvider>,
    );

    rerender(
      <PageOverlayControllerProvider>
        <PageOverlay overlayKey="second" open onRequestClose={onCloseSecond} render={<div>Second overlay</div>} />
        <PageOverlayOutlet />
      </PageOverlayControllerProvider>,
    );

    expect(await screen.findByText("Second overlay")).toBeInTheDocument();
    expect(onCloseFirst).not.toHaveBeenCalled();
  });
});
