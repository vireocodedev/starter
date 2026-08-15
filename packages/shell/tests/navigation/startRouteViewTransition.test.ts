import { createRouteViewTransition } from "@/navigation/startRouteViewTransition";
import { afterEach, describe, expect, it, vi } from "vitest";

type TestStartViewTransition = (callback: () => void | Promise<void>) => { finished: Promise<void> };

const directionAttributeName = "data-test-transition-direction";
const routeCommitAttributeName = "data-test-route";

function createHarness({
  reducedMotion = false,
  timeoutMs = 100,
}: { reducedMotion?: boolean; timeoutMs?: number } = {}) {
  let destination = "/current";
  const startViewTransition = vi.fn((callback: () => void | Promise<void>) => ({
    finished: Promise.resolve(callback()).then(() => undefined),
  }));
  const startTransition = createRouteViewTransition<"back" | "forward">({
    directionAttributeName,
    getDestinationIdentity: () => destination,
    getDirectionToken: direction => (direction === "back" ? "reverse" : "advance"),
    isReducedMotion: () => reducedMotion,
    isRouteCommitted: (element, identity) => element.getAttribute(routeCommitAttributeName) === identity,
    routeCommitAttributeName,
    routeCommitTimeoutMs: timeoutMs,
  });

  return {
    setDestination: (value: string) => {
      destination = value;
    },
    startTransition,
    startViewTransition,
  };
}

function setStartViewTransition(value: TestStartViewTransition | undefined): void {
  Object.defineProperty(document, "startViewTransition", { configurable: true, value });
}

afterEach(() => {
  vi.useRealTimers();
  document.documentElement.removeAttribute(directionAttributeName);
  document.body.replaceChildren();
  setStartViewTransition(undefined);
});

describe("createRouteViewTransition", () => {
  it("navigates immediately and clears direction state when View Transitions are unavailable", async () => {
    const harness = createHarness();
    const navigate = vi.fn();

    await harness.startTransition(navigate, "forward");

    expect(navigate).toHaveBeenCalledOnce();
    expect(document.documentElement.hasAttribute(directionAttributeName)).toBe(false);
  });

  it("respects injected reduced-motion policy", async () => {
    const harness = createHarness({ reducedMotion: true });
    setStartViewTransition(harness.startViewTransition);
    const navigate = vi.fn();

    await harness.startTransition(navigate, "back");

    expect(navigate).toHaveBeenCalledOnce();
    expect(harness.startViewTransition).not.toHaveBeenCalled();
    expect(document.documentElement.hasAttribute(directionAttributeName)).toBe(false);
  });

  it("keeps the transition open until the injected destination commit marker appears", async () => {
    const harness = createHarness();
    setStartViewTransition(harness.startViewTransition);
    const navigate = vi.fn(() => harness.setDestination("/next"));

    const transition = harness.startTransition(navigate, "back");

    expect(navigate).toHaveBeenCalledOnce();
    expect(document.documentElement.getAttribute(directionAttributeName)).toBe("reverse");

    const destination = document.createElement("main");
    destination.setAttribute(routeCommitAttributeName, "/next");
    document.body.append(destination);

    await transition;

    expect(harness.startViewTransition).toHaveBeenCalledOnce();
    expect(document.documentElement.hasAttribute(directionAttributeName)).toBe(false);
  });

  it("falls back after the configured route-commit timeout", async () => {
    vi.useFakeTimers();
    const harness = createHarness({ timeoutMs: 25 });
    setStartViewTransition(harness.startViewTransition);

    const transition = harness.startTransition(() => harness.setDestination("/lazy"), "forward");
    await vi.advanceTimersByTimeAsync(25);
    await transition;

    expect(document.documentElement.hasAttribute(directionAttributeName)).toBe(false);
  });
});
