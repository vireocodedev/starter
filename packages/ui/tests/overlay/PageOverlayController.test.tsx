import { PageOverlay, PageOverlayControllerProvider, PageOverlayOutlet } from "@/overlay/PageOverlayController";
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
});
