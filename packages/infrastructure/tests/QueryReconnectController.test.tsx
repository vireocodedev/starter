import { QueryReconnectController } from "@/index";
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("QueryReconnectController", () => {
  it("does not refetch when it mounts online", () => {
    const refetchActiveQueries = vi.fn();
    render(<QueryReconnectController online refetchActiveQueries={refetchActiveQueries} />);
    expect(refetchActiveQueries).not.toHaveBeenCalled();
  });

  it("refetches after every distinct offline-to-online transition", async () => {
    const refetchActiveQueries = vi.fn();
    const view = render(<QueryReconnectController online refetchActiveQueries={refetchActiveQueries} />);
    view.rerender(<QueryReconnectController online={false} refetchActiveQueries={refetchActiveQueries} />);
    view.rerender(<QueryReconnectController online refetchActiveQueries={refetchActiveQueries} />);
    await waitFor(() => expect(refetchActiveQueries).toHaveBeenCalledTimes(1));
    view.rerender(<QueryReconnectController online={false} refetchActiveQueries={refetchActiveQueries} />);
    view.rerender(<QueryReconnectController online refetchActiveQueries={refetchActiveQueries} />);
    await waitFor(() => expect(refetchActiveQueries).toHaveBeenCalledTimes(2));
  });

  it("contains rejected refetch promises", async () => {
    const refetchActiveQueries = vi.fn().mockRejectedValue(new Error("temporary query failure"));
    const view = render(<QueryReconnectController online={false} refetchActiveQueries={refetchActiveQueries} />);
    view.rerender(<QueryReconnectController online refetchActiveQueries={refetchActiveQueries} />);
    await waitFor(() => expect(refetchActiveQueries).toHaveBeenCalledOnce());
  });
});
