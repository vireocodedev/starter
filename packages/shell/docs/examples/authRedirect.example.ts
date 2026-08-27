import { createAuthRedirectState, resolvePostLoginPath } from "@vireocodedev/shell";

export function runAuthRedirectExample() {
  const state = createAuthRedirectState(
    { pathname: "/customers/42", search: "?tab=history", hash: "#latest" },
    "/login",
  );

  return {
    state,
    accepted: resolvePostLoginPath(state, "/"),
    rejected: resolvePostLoginPath({ from: "//attacker.example" }, "/"),
  };
}
