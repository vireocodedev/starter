import { VireoOverlayHeader } from "@/capabilities/overlays/public";
import { VireoIcon, VireoSnack } from "@/core/public";
import { VireoJsonViewer } from "@/core/public";
import { useTranslationLocal } from "@/setup/config/hooks/useTranslationLocal";
import { serializeError, type RgoMutationData, type RgoMutationVariables } from "@/utils/apiutils";
import { type TODO } from "@/utils/typeutils";
import { Dialog, DialogContent, IconButton, Tooltip } from "@mui/material";
import { useMutation, type DefaultError, type UseMutationOptions } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

function MutationErrorDetailsButton({ data }: { data: unknown }) {
  const t = useTranslationLocal();
  const [open, setOpen] = React.useState(false);
  const tooltip = "Show details";
  const handleClose = React.useCallback(() => setOpen(false), []);

  return (
    <>
      <Tooltip title={tooltip}>
        <IconButton
          size="small"
          color="inherit"
          onClick={event => {
            event.stopPropagation();
            setOpen(true);
          }}
          aria-label={tooltip}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z" />
          </svg>
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <VireoOverlayHeader title={t("common.errorDetails")} closeLabel={t("common.close")} onClose={handleClose} />
        <DialogContent sx={{ pt: "20px" }}>
          <VireoJsonViewer data={data} maxHeight="60vh" copyLabel="Copy JSON to clipboard" copiedLabel="JSON copied" />
        </DialogContent>
      </Dialog>
    </>
  );
}

export type UseMutationBasicProps<TData = unknown, TVariables = void, TError = DefaultError, TContext = unknown> = {
  mutationFn: UseMutationOptions<TData, TError, TVariables, TContext>["mutationFn"];
  messageSuccess?: string | ((data: TData) => string | undefined);
  messageError?: string | ((error: TError) => string | undefined);
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, "mutationFn">;
};

export type UseMutationBasicPropsOptions<
  TMutationFn extends (...args: TODO[]) => TODO,
  TError = DefaultError,
  TContext = unknown,
> = UseMutationBasicProps<RgoMutationData<TMutationFn>, RgoMutationVariables<TMutationFn>, TError, TContext>["options"];

export function useRgoMutation<TData = unknown, TVariables = void, TError = DefaultError, TContext = unknown>({
  mutationFn,
  messageSuccess,
  messageError,
  options = {},
}: UseMutationBasicProps<TData, TVariables, TError, TContext>) {
  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    mutationFn,
    onSuccess: (...args) => {
      options.onSuccess?.(...args);
      const [data] = args;
      if (messageSuccess) {
        const message = typeof messageSuccess === "function" ? messageSuccess(data) : messageSuccess;
        if (message) {
          toast.custom(() => (
            <VireoSnack variant="success" startAdornment={<VireoIcon icon="check-circle" />} message={message} />
          ));
        }
      }
    },
    onError: (...args) => {
      options.onError?.(...args);
      const [error] = args;
      if (messageError) {
        const message = typeof messageError === "function" ? messageError(error) : messageError;
        if (message) {
          toast.custom(() => (
            <VireoSnack
              variant="error"
              startAdornment={<VireoIcon icon="x-circle" />}
              message={message}
              endAdornment={<MutationErrorDetailsButton data={serializeError(error)} />}
            />
          ));
        }
      }
    },
  });
}
