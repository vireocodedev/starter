import {
  createOverlayHistoryRegistry,
  readOverlayStack,
  resolveOverlayHistoryAction,
  withOverlayStack,
} from "@vireocodedev/starter-shell";

export function runOverlayHistoryExample() {
  const registry = createOverlayHistoryRegistry();
  registry.register({ id: "customer-drawer", requestClose: () => undefined });
  registry.register({ id: "edit-dialog", requestClose: () => undefined });
  const desired = registry.getSnapshot().map(entry => entry.id);
  const action = resolveOverlayHistoryAction({
    desired,
    actual: ["customer-drawer"],
    previousActual: ["customer-drawer"],
    navigationType: "PUSH",
    locationChanged: false,
    urlChanged: false,
  });
  const state = withOverlayStack({ consumerState: "preserved" }, desired);

  return { desired, action, encodedStack: readOverlayStack(state), state };
}
