import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// React Router builds a Request for every navigation using jsdom's
// AbortSignal. Node's native Request rejects that cross-realm signal, so drop
// it in tests; none of these navigation tests exercise in-flight cancellation.
const NativeRequest = globalThis.Request;

class RouterCompatibleRequest extends NativeRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init?.signal == null ? init : { ...init, signal: undefined });
  }
}

Object.defineProperty(globalThis, "Request", {
  configurable: true,
  value: RouterCompatibleRequest,
  writable: true,
});

// Vitest's `test.globals` is not enabled for this package, so
// @testing-library/react's automatic afterEach-cleanup detection (which only
// activates when `afterEach` exists on the global scope) never fires. Without
// this, DOM nodes from one test's render() leak into the next test in the
// same file, causing "multiple elements found" failures.
afterEach(() => {
  cleanup();
});
