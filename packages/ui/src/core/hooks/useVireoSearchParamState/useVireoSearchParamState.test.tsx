import React from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import {
  type VireoSearchParamCodec,
  useVireoSearchParamState,
  vireoSearchParamCodecs,
} from "./useVireoSearchParamState";

function replaceUrl(url: string, state: unknown = null) {
  window.history.replaceState(state, "", url);
}

describe("useVireoSearchParamState", () => {
  beforeEach(() => {
    replaceUrl("/search-param-tests");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    replaceUrl("/search-param-tests");
  });

  it("uses an implicit string codec, encodes writes, and removes the default", () => {
    const { result } = renderHook(() => useVireoSearchParamState("query", { defaultValue: "" }));

    expect(result.current[0]).toBe("");
    act(() => result.current[1]("design & UX"));
    expect(result.current[0]).toBe("design & UX");
    expect(window.location.search).toBe("?query=design+%26+UX");

    act(() => result.current[1](""));
    expect(window.location.search).toBe("");
    expect(result.current[0]).toBe("");
  });

  it("distinguishes an empty present string from a missing parameter", () => {
    replaceUrl("/search-param-tests?query=");
    const { result } = renderHook(() => useVireoSearchParamState("query", { defaultValue: "fallback" }));

    expect(result.current[0]).toBe("");
    expect(window.location.search).toBe("?query=");
  });

  it("canonicalizes the first repeated numeric value and removes duplicates", async () => {
    replaceUrl("/search-param-tests?page=01&page=7");
    const { result } = renderHook(() =>
      useVireoSearchParamState("page", { defaultValue: 0, codec: vireoSearchParamCodecs.number }),
    );

    expect(result.current[0]).toBe(1);
    await waitFor(() => expect(window.location.search).toBe("?page=1"));
  });

  it("falls back from invalid values and follows the default-retention policy", async () => {
    replaceUrl("/search-param-tests?enabled=TRUE");
    const removed = renderHook(() =>
      useVireoSearchParamState("enabled", { defaultValue: false, codec: vireoSearchParamCodecs.boolean }),
    );
    expect(removed.result.current[0]).toBe(false);
    await waitFor(() => expect(window.location.search).toBe(""));
    removed.unmount();

    replaceUrl("/search-param-tests?enabled=invalid");
    const retained = renderHook(() =>
      useVireoSearchParamState("enabled", {
        defaultValue: false,
        codec: vireoSearchParamCodecs.boolean,
        keepDefaultInUrl: true,
      }),
    );
    expect(retained.result.current[0]).toBe(false);
    await waitFor(() => expect(window.location.search).toBe("?enabled=false"));
  });

  it("writes a retained default on mount", async () => {
    renderHook(() =>
      useVireoSearchParamState("page", {
        defaultValue: 1,
        codec: vireoSearchParamCodecs.number,
        keepDefaultInUrl: true,
      }),
    );

    await waitFor(() => expect(window.location.search).toBe("?page=1"));
  });

  it("uses null exclusively for parameter absence", () => {
    const { result } = renderHook(() =>
      useVireoSearchParamState("customer", { defaultValue: null, codec: vireoSearchParamCodecs.string }),
    );

    expect(result.current[0]).toBeNull();
    act(() => result.current[1]("northstar"));
    expect(result.current[0]).toBe("northstar");
    act(() => result.current[1](null));
    expect(result.current[0]).toBeNull();
    expect(window.location.search).toBe("");
  });

  it("preserves URL structure, unrelated ordering, duplicates, hash, and history state", () => {
    const state = { router: "preserved" };
    replaceUrl("/customers?workspace=12&page=1&filter=a&filter=b#activity", state);
    const { result } = renderHook(() =>
      useVireoSearchParamState("page", { defaultValue: 0, codec: vireoSearchParamCodecs.number }),
    );

    act(() => result.current[1](2));

    expect(`${window.location.pathname}${window.location.search}${window.location.hash}`).toBe(
      "/customers?workspace=12&page=2&filter=a&filter=b#activity",
    );
    expect(window.history.state).toBe(state);
  });

  it("uses the configured history strategy only for logical value changes", () => {
    replaceUrl("/search-param-tests?page=01");
    const pushState = vi.spyOn(window.history, "pushState");
    const replaceState = vi.spyOn(window.history, "replaceState");
    const { result } = renderHook(() =>
      useVireoSearchParamState("page", {
        defaultValue: 0,
        codec: vireoSearchParamCodecs.number,
        history: "push",
      }),
    );

    act(() => result.current[1](1));
    expect(replaceState).toHaveBeenCalledOnce();
    expect(pushState).not.toHaveBeenCalled();

    act(() => result.current[1](2));
    expect(pushState).toHaveBeenCalledOnce();
  });

  it("composes sequential functional updates from the latest URL value", () => {
    const { result } = renderHook(() =>
      useVireoSearchParamState("page", { defaultValue: 0, codec: vireoSearchParamCodecs.number }),
    );

    act(() => {
      result.current[1](current => current + 1);
      result.current[1](current => current + 1);
    });

    expect(result.current[0]).toBe(2);
    expect(window.location.search).toBe("?page=2");
  });

  it("synchronizes mounted instances and popstate navigation", () => {
    const first = renderHook(() => useVireoSearchParamState("tab", { defaultValue: "profile" }));
    const second = renderHook(() => useVireoSearchParamState("tab", { defaultValue: "profile" }));

    act(() => first.result.current[1]("security"));
    expect(second.result.current[0]).toBe("security");

    act(() => {
      window.history.pushState(window.history.state, "", "/search-param-tests?tab=notifications");
      window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
    });
    expect(first.result.current[0]).toBe("notifications");
    expect(second.result.current[0]).toBe("notifications");
  });

  it("keeps the setter stable and skips canonical no-op writes", () => {
    replaceUrl("/search-param-tests?tab=security");
    const replaceState = vi.spyOn(window.history, "replaceState");
    const { result, rerender } = renderHook(() =>
      useVireoSearchParamState("tab", { defaultValue: "profile", codec: { ...vireoSearchParamCodecs.string } }),
    );
    const setter = result.current[1];

    rerender();
    expect(result.current[1]).toBe(setter);
    act(() => result.current[1]("security"));
    expect(replaceState).not.toHaveBeenCalled();
  });

  it("applies dynamic keys, defaults, codecs, history, and retention without deleting the old key", async () => {
    replaceUrl("/search-param-tests?first=2&second=true");
    const { result, rerender } = renderHook(
      ({ key, defaultValue, codec, keepDefaultInUrl }) =>
        useVireoSearchParamState(key, { defaultValue, codec, keepDefaultInUrl, history: "push" }),
      {
        initialProps: {
          key: "first",
          defaultValue: 0 as number | boolean,
          codec: vireoSearchParamCodecs.number as VireoSearchParamCodec<number | boolean>,
          keepDefaultInUrl: false,
        },
      },
    );
    expect(result.current[0]).toBe(2);

    rerender({
      key: "second",
      defaultValue: true,
      codec: vireoSearchParamCodecs.boolean as VireoSearchParamCodec<number | boolean>,
      keepDefaultInUrl: false,
    });
    expect(result.current[0]).toBe(true);
    await waitFor(() => expect(window.location.search).toBe("?first=2"));
  });

  it("throws for invalid keys and developer configurations", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useVireoSearchParamState(" tab", { defaultValue: "profile" }))).toThrow(
      "key must be a non-empty string",
    );
    expect(() =>
      renderHook(() =>
        useVireoSearchParamState("page", { defaultValue: 1 } as unknown as Parameters<
          typeof useVireoSearchParamState
        >[1]),
      ),
    ).toThrow("requires a codec");
    expect(() =>
      renderHook(() =>
        useVireoSearchParamState("customer", {
          defaultValue: null,
          codec: vireoSearchParamCodecs.string,
          keepDefaultInUrl: true,
        } as unknown as Parameters<typeof useVireoSearchParamState>[1]),
      ),
    ).toThrow("cannot keep a null default value");
    expect(() =>
      renderHook(() =>
        useVireoSearchParamState("query", {
          defaultValue: "default",
          codec: {
            parse: (value: string) => value,
            serialize: () => 4,
          } as unknown as VireoSearchParamCodec<string>,
        }),
      ),
    ).toThrow("codec.serialize must return a string");
  });

  it("rejects nullish parser results as codec contract violations", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    replaceUrl("/search-param-tests?query=value");
    expect(() =>
      renderHook(() =>
        useVireoSearchParamState("query", {
          defaultValue: "default",
          codec: {
            parse: () => null,
            serialize: (value: string) => value,
          } as unknown as VireoSearchParamCodec<string>,
        }),
      ),
    ).toThrow("codec.parse must not return null or undefined");
  });

  it("contains read cleanup failures but propagates setter failures before mutation", () => {
    replaceUrl("/search-param-tests?page=invalid");
    const replaceState = vi.spyOn(window.history, "replaceState").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });
    const invalid = renderHook(() =>
      useVireoSearchParamState("page", { defaultValue: 1, codec: vireoSearchParamCodecs.number }),
    );
    expect(invalid.result.current[0]).toBe(1);
    expect(window.location.search).toBe("?page=invalid");
    invalid.unmount();
    replaceState.mockRestore();

    replaceUrl("/search-param-tests");
    const throwingCodec: VireoSearchParamCodec<number> = {
      parse: Number,
      serialize: value => {
        if (value === 2) throw new Error("Cannot serialize two");
        return String(value);
      },
    };
    const writable = renderHook(() => useVireoSearchParamState("page", { defaultValue: 1, codec: throwingCodec }));
    expect(() => act(() => writable.result.current[1](2))).toThrow("Cannot serialize two");
    expect(window.location.search).toBe("");
    expect(() =>
      act(() => {
        writable.result.current[1](() => {
          throw new Error("Updater failed");
        });
      }),
    ).toThrow("Updater failed");
  });

  it("uses the server default snapshot and synchronizes the browser value after hydration", async () => {
    replaceUrl("/search-param-tests?page=9");
    const container = document.createElement("div");
    document.body.append(container);
    let root: Root | undefined;

    function Probe() {
      const [page] = useVireoSearchParamState("page", {
        defaultValue: 1,
        codec: vireoSearchParamCodecs.number,
      });
      return <span>{page}</span>;
    }

    const serverHtml = renderToString(<Probe />);
    expect(serverHtml).toContain(">1<");
    container.innerHTML = serverHtml;
    await act(async () => {
      root = hydrateRoot(container, <Probe />);
    });
    await waitFor(() => expect(container).toHaveTextContent("9"));
    act(() => root?.unmount());
    container.remove();
  });

  it("defines strict built-in codec edge cases", () => {
    expect(vireoSearchParamCodecs.number.parse(".5")).toBe(0.5);
    expect(vireoSearchParamCodecs.number.parse("-2.5E-2")).toBe(-0.025);
    expect(vireoSearchParamCodecs.number.serialize(-0)).toBe("0");
    for (const invalid of ["", " 1 ", "NaN", "Infinity", "0x10", "1_000", "1,5"]) {
      expect(() => vireoSearchParamCodecs.number.parse(invalid)).toThrow();
    }
    expect(vireoSearchParamCodecs.boolean.parse("true")).toBe(true);
    expect(() => vireoSearchParamCodecs.boolean.parse("TRUE")).toThrow();
    expect(Object.isFrozen(vireoSearchParamCodecs)).toBe(true);
  });

  it("exposes the approved compile-time overloads", () => {
    const useCompileTypeContracts = () => {
      const [text, setText] = useVireoSearchParamState("text", { defaultValue: "" });
      expectTypeOf(text).toEqualTypeOf<string>();
      setText("next");

      const [page, setPage] = useVireoSearchParamState("page", {
        defaultValue: 1,
        codec: vireoSearchParamCodecs.number,
      });
      expectTypeOf(page).toEqualTypeOf<number>();
      setPage(current => current + 1);

      const [customer, setCustomer] = useVireoSearchParamState("customer", {
        defaultValue: null,
        codec: vireoSearchParamCodecs.string,
      });
      expectTypeOf(customer).toEqualTypeOf<string | null>();
      setCustomer(null);

      // @ts-expect-error Non-string state requires a codec.
      useVireoSearchParamState("missing-codec", { defaultValue: 1 });
      // @ts-expect-error Nullable state requires a codec.
      useVireoSearchParamState("missing-nullable-codec", { defaultValue: null });
      useVireoSearchParamState("nullable-retained", {
        // @ts-expect-error A null default cannot be retained in the URL.
        defaultValue: null,
        codec: vireoSearchParamCodecs.string,
        keepDefaultInUrl: true,
      });
      // @ts-expect-error Undefined is not a supported default.
      useVireoSearchParamState("undefined", { defaultValue: undefined });
      // @ts-expect-error Non-null state cannot be cleared with null.
      setPage(null);
      // @ts-expect-error Undefined is never a supported state value.
      setText(undefined);
    };
    expectTypeOf(useCompileTypeContracts).toBeFunction();
  });
});
