import { useMobileTableExpansion } from "@/table/hooks/useMobileTableExpansion";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Row = { id: number };

const keyMapper = (row: Row) => row.id;

const renderExpansion = (data: Row[], defaultExpanded = false) =>
  renderHook(({ data }: { data: Row[] }) => useMobileTableExpansion({ data, defaultExpanded, keyMapper }), {
    initialProps: { data },
  });

describe("useMobileTableExpansion", () => {
  it("seeds every row with the default expansion state", () => {
    const { result } = renderExpansion([{ id: 1 }, { id: 2 }], true);
    expect(result.current.expandedByKey).toEqual({ "1": true, "2": true });
  });

  it("keys rows by the mapper's stringified result", () => {
    const { result } = renderExpansion([{ id: 7 }]);
    expect(Object.keys(result.current.expandedByKey)).toEqual(["7"]);
  });

  it("toggles a single row without touching its siblings", () => {
    const { result } = renderExpansion([{ id: 1 }, { id: 2 }]);

    act(() => result.current.handleExpandedChange("1", true));

    expect(result.current.expandedByKey).toEqual({ "1": true, "2": false });
  });

  it("preserves a user's expansion across a data refresh", () => {
    const { result, rerender } = renderExpansion([{ id: 1 }, { id: 2 }]);

    act(() => result.current.handleExpandedChange("2", true));
    rerender({ data: [{ id: 1 }, { id: 2 }] });

    expect(result.current.expandedByKey["2"]).toBe(true);
  });

  it("drops rows that are no longer present", () => {
    const { result, rerender } = renderExpansion([{ id: 1 }, { id: 2 }]);

    act(() => result.current.handleExpandedChange("2", true));
    rerender({ data: [{ id: 1 }] });

    expect(result.current.expandedByKey).toEqual({ "1": false });
  });

  it("seeds newly arrived rows with the default", () => {
    const { result, rerender } = renderExpansion([{ id: 1 }], true);

    act(() => result.current.handleExpandedChange("1", false));
    rerender({ data: [{ id: 1 }, { id: 2 }] });

    expect(result.current.expandedByKey).toEqual({ "1": false, "2": true });
  });
});

describe("useMobileTableExpansion scrolling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("scrolls a row into view after the expand animation settles", () => {
    const { result } = renderExpansion([{ id: 1 }]);
    const scrollIntoView = vi.fn();
    act(() => result.current.setAccordionRef("1", { scrollIntoView } as unknown as HTMLDivElement));

    act(() => result.current.handleExpandedChange("1", true));
    expect(scrollIntoView).not.toHaveBeenCalled();

    act(() => void vi.advanceTimersByTime(250));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "nearest" });
  });

  it("does not scroll when a row is collapsed", () => {
    const { result } = renderExpansion([{ id: 1 }], true);
    const scrollIntoView = vi.fn();
    act(() => result.current.setAccordionRef("1", { scrollIntoView } as unknown as HTMLDivElement));

    act(() => result.current.handleExpandedChange("1", false));
    act(() => void vi.advanceTimersByTime(250));

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("tolerates a row whose ref was detached before the timer fired", () => {
    const { result } = renderExpansion([{ id: 1 }]);
    act(() => result.current.setAccordionRef("1", null));

    act(() => result.current.handleExpandedChange("1", true));

    expect(() => act(() => void vi.advanceTimersByTime(250))).not.toThrow();
  });
});
