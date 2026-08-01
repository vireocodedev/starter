import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest's `test.globals` is not enabled for this package, so
// @testing-library/react's automatic afterEach-cleanup detection (which only
// activates when `afterEach` exists on the global scope) never fires. Without
// this, DOM nodes from one test's render() leak into the next test in the
// same file, causing "multiple elements found" failures.
afterEach(() => {
  cleanup();
});
