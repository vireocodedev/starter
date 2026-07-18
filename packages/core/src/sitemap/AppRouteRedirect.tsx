import React from "react";
import { generatePath, Navigate, useParams } from "react-router";

export function AppRouteRedirect({ toPattern }: { toPattern: string }) {
  const params = useParams();

  return React.createElement(Navigate, { to: generatePath(toPattern, params), replace: true });
}
