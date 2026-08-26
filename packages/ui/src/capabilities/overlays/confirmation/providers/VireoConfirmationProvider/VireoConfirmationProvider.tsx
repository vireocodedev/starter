import { VireoConfirmationDialog } from "@/capabilities/overlays/confirmation/components/overlays/VireoConfirmationDialog/VireoConfirmationDialog";
import {
  VireoConfirmationContext,
  type VireoConfirm,
  type VireoConfirmationOptions,
} from "@/capabilities/overlays/confirmation/contexts/VireoConfirmationContext/VireoConfirmationContext";
import React from "react";

export type VireoConfirmationProviderProps = {
  children: React.ReactNode;
  defaultCloseLabel?: string;
  defaultCancelLabel?: string;
  defaultConfirmLabel?: string;
};

type ActiveConfirmation = {
  options: VireoConfirmationOptions;
  resolve: (confirmed: boolean) => void;
};

/** Hosts one shared confirmation dialog and exposes a promise-based decision API to descendants. */
export function VireoConfirmationProvider({
  children,
  defaultCloseLabel = "Close",
  defaultCancelLabel = "Cancel",
  defaultConfirmLabel = "Confirm",
}: VireoConfirmationProviderProps) {
  const [active, setActive] = React.useState<ActiveConfirmation | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const activeRef = React.useRef<ActiveConfirmation | null>(null);

  const settle = React.useCallback((confirmed: boolean) => {
    const current = activeRef.current;
    if (!current) return;
    activeRef.current = null;
    setLoading(false);
    setOpen(false);
    current.resolve(confirmed);
  }, []);

  const handleExited = React.useCallback(() => {
    if (activeRef.current == null) setActive(null);
  }, []);

  const confirm = React.useCallback<VireoConfirm>(options => {
    activeRef.current?.resolve(false);
    setLoading(false);
    return new Promise<boolean>(resolve => {
      const next = { options, resolve };
      activeRef.current = next;
      setActive(next);
      setOpen(true);
    });
  }, []);

  const handleConfirm = React.useCallback(async () => {
    const current = activeRef.current;
    if (!current) return;
    if (!current.options.onConfirm) {
      settle(true);
      return;
    }

    setLoading(true);
    try {
      await current.options.onConfirm();
      if (activeRef.current === current) settle(true);
    } catch {
      if (activeRef.current === current) setLoading(false);
    }
  }, [settle]);

  React.useEffect(() => () => activeRef.current?.resolve(false), []);

  return (
    <VireoConfirmationContext.Provider value={confirm}>
      {children}
      <VireoConfirmationDialog
        open={open}
        title={active?.options.title ?? ""}
        message={active?.options.message ?? ""}
        closeLabel={active?.options.closeLabel ?? defaultCloseLabel}
        cancelLabel={active?.options.cancelLabel ?? defaultCancelLabel}
        confirmLabel={active?.options.confirmLabel ?? defaultConfirmLabel}
        confirmColor={active?.options.confirmColor}
        loading={loading}
        maxWidth={active?.options.maxWidth}
        onClose={() => settle(false)}
        onConfirm={() => void handleConfirm()}
        onExited={handleExited}
      />
    </VireoConfirmationContext.Provider>
  );
}
