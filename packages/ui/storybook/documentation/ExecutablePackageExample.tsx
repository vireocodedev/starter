import { Source } from "@storybook/addon-docs/blocks";
import React from "react";

export type ExecutablePackageExampleProps<TResult> = {
  run: () => TResult | Promise<TResult>;
  source: string;
  outputLabel?: string;
};

type ExampleState =
  { status: "pending" } | { status: "resolved"; value: unknown } | { status: "rejected"; error: unknown };

function formatResult(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === undefined) return "undefined";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Storybook-only renderer for executable, framework-free package examples. */
export function ExecutablePackageExample<TResult>({
  run,
  source,
  outputLabel = "Live output",
}: ExecutablePackageExampleProps<TResult>) {
  const [state, setState] = React.useState<ExampleState>({ status: "pending" });

  React.useEffect(() => {
    let active = true;
    setState({ status: "pending" });

    Promise.resolve()
      .then(run)
      .then(
        value => {
          if (active) setState({ status: "resolved", value });
        },
        error => {
          if (active) setState({ status: "rejected", error });
        },
      );

    return () => {
      active = false;
    };
  }, [run]);

  return (
    <div className="vireo-package-example">
      <section aria-busy={state.status === "pending"} className="vireo-package-example__output">
        <div className="vireo-package-example__label">{outputLabel}</div>
        {state.status === "pending" && <div className="vireo-package-example__pending">Running example…</div>}
        {state.status === "resolved" && <pre>{formatResult(state.value)}</pre>}
        {state.status === "rejected" && <pre className="vireo-package-example__error">{errorMessage(state.error)}</pre>}
      </section>
      <details className="vireo-package-example__source">
        <summary>Show code</summary>
        <Source code={source.trim()} language="typescript" />
      </details>
    </div>
  );
}
