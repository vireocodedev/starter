import { VireoIcon } from "@/core/components/data-display/VireoIcon";
import { VireoSnack } from "@/core/components/feedback/VireoSnack";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";
import { VireoMutationErrorDetailsButton } from "@/core/hooks/useVireoMutation/internal/VireoMutationErrorDetailsButton";
import type {
  UseVireoMutationOptions,
  VireoMutationErrorDetails,
  VireoMutationMessage,
} from "./useVireoMutation.types";

function resolveMessage<TValue>(message: VireoMutationMessage<TValue> | undefined, value: TValue): React.ReactNode {
  return typeof message === "function" ? message(value) : message;
}

function selectDefaultErrorDetails(error: unknown): unknown {
  if (typeof error !== "object" || error === null || !("response" in error)) return error;
  const response = error.response;
  if (typeof response !== "object" || response === null || !("data" in response)) return error;
  return response.data;
}

function parseErrorDetails<TError, TDetails>(
  error: TError,
  options: VireoMutationErrorDetails<TError, TDetails> | undefined,
): { data: TDetails; options: VireoMutationErrorDetails<TError, TDetails> } | null {
  if (!options) return null;
  const result = options.schema.safeParse(options.select?.(error) ?? selectDefaultErrorDetails(error));
  return result.success ? { data: result.data, options } : null;
}

/** Extends TanStack Query mutations with Vireo notifications and schema-validated error details. */
export function useVireoMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
  TErrorDetails = unknown,
>({
  mutationFn,
  successMessage,
  errorMessage,
  errorDetails,
  onSuccess,
  onError,
  ...options
}: UseVireoMutationOptions<TData, TError, TVariables, TContext, TErrorDetails>) {
  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    mutationFn,
    onSuccess: (...args) => {
      onSuccess?.(...args);
      const message = resolveMessage(successMessage, args[0]);
      if (message == null || message === false || message === "") return;
      toast.custom(() => (
        <VireoSnack variant="success" startAdornment={<VireoIcon icon="check-circle" />} message={message} />
      ));
    },
    onError: (...args) => {
      onError?.(...args);
      const message = resolveMessage(errorMessage, args[0]);
      if (message == null || message === false || message === "") return;
      const parsedDetails = parseErrorDetails(args[0], errorDetails);
      toast.custom(() => (
        <VireoSnack
          variant="error"
          startAdornment={<VireoIcon icon="x-circle" />}
          message={message}
          endAdornment={
            parsedDetails ? (
              <VireoMutationErrorDetailsButton
                data={parsedDetails.data}
                options={parsedDetails.options as VireoMutationErrorDetails<unknown, TErrorDetails>}
              />
            ) : undefined
          }
        />
      ));
    },
  });
}

export type {
  UseVireoMutationOptions,
  VireoMutationErrorDetails,
  VireoMutationMessage,
} from "./useVireoMutation.types";
