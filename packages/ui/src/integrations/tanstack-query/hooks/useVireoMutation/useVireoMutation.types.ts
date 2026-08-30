import type { UseMutationOptions } from "@tanstack/react-query";
import type React from "react";
import type { z } from "zod";

export type VireoMutationMessage<TValue> = React.ReactNode | ((value: TValue) => React.ReactNode);

export type VireoMutationErrorDetails<TError, TDetails> = {
  /** Validates the application-selected error payload before it is rendered. */
  schema: z.ZodType<TDetails>;
  /** Selects the unknown payload validated by `schema`. Defaults to an Axios-style `response.data`, then the error. */
  select?: (error: TError) => unknown;
  /** @default 'Show error details' */
  label?: string;
  /** @default 'Error details' */
  title?: React.ReactNode;
  /** @default 'Close' */
  closeLabel?: string;
  /** @default 'Copy JSON to clipboard' */
  copyLabel?: string;
  /** @default 'JSON copied' */
  copiedLabel?: string;
  /** @default 'Unable to copy JSON' */
  copyErrorLabel?: string;
};

export type UseVireoMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
  TErrorDetails = unknown,
> = Omit<UseMutationOptions<TData, TError, TVariables, TContext>, "mutationFn" | "onError" | "onSuccess"> & {
  mutationFn: NonNullable<UseMutationOptions<TData, TError, TVariables, TContext>["mutationFn"]>;
  successMessage?: VireoMutationMessage<TData>;
  errorMessage?: VireoMutationMessage<TError>;
  errorDetails?: VireoMutationErrorDetails<TError, TErrorDetails>;
  onSuccess?: UseMutationOptions<TData, TError, TVariables, TContext>["onSuccess"];
  onError?: UseMutationOptions<TData, TError, TVariables, TContext>["onError"];
};
