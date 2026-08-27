import { createConnectivityState, parseHttpResponse, parseQueryFilterRequest } from "@vireocodedev/infrastructure";
import z from "zod";

function captureFailure(run: () => unknown): string {
  try {
    run();
    return "No error was raised.";
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

export function runFailureSemanticsExample() {
  return {
    malformedFilter: captureFailure(() => parseQueryFilterRequest("{not-json")),
    invalidResponse: captureFailure(() => parseHttpResponse(z.object({ id: z.number() }), { id: "wrong" })),
    invalidConnectivityPolicy: captureFailure(() =>
      createConnectivityState({
        initialBrowserOnline: true,
        heartbeatStaleAfterMs: 0,
        heartbeatBootstrapAssumeOnlineMs: 0,
      }),
    ),
  };
}
