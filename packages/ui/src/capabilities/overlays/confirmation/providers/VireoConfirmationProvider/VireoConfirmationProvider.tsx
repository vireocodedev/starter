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
  const activeRef = React.useRef<ActiveConfirmation | null>(null);

  const settle = React.useCallback((confirmed: boolean) => {
    const current = activeRef.current;
    if (!current) return;
    activeRef.current = null;
    setActive(null);
    current.resolve(confirmed);
  }, []);

  const confirm = React.useCallback<VireoConfirm>(options => {
    activeRef.current?.resolve(false);
    return new Promise<boolean>(resolve => {
      const next = { options, resolve };
      activeRef.current = next;
      setActive(next);
    });
  }, []);

  React.useEffect(() => () => activeRef.current?.resolve(false), []);

  return (
    <VireoConfirmationContext.Provider value={confirm}>
      {children}
      <VireoConfirmationDialog
        open={active != null}
        title={active?.options.title ?? ""}
        message={active?.options.message ?? ""}
        closeLabel={active?.options.closeLabel ?? defaultCloseLabel}
        cancelLabel={active?.options.cancelLabel ?? defaultCancelLabel}
        confirmLabel={active?.options.confirmLabel ?? defaultConfirmLabel}
        confirmColor={active?.options.confirmColor}
        maxWidth={active?.options.maxWidth}
        onClose={() => settle(false)}
        onConfirm={() => settle(true)}
      />
    </VireoConfirmationContext.Provider>
  );
}
