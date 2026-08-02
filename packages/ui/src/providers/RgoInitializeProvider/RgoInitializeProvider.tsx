import React from "react";
import "./RgoInitializeProvider.css";

type RgoInitializeProviderCleanup = void | (() => void);

export type RgoInitializeProviderOnInit = () => RgoInitializeProviderCleanup | Promise<RgoInitializeProviderCleanup>;

export type RgoInitializeProviderProps = {
  children: React.ReactNode;
  onInit: RgoInitializeProviderOnInit;
};

export function RgoInitializeProvider({ children, onInit }: RgoInitializeProviderProps) {
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  React.useEffect(() => {
    let mounted = true;
    let cleanup: RgoInitializeProviderCleanup;

    void Promise.resolve(onInit())
      .then(result => {
        cleanup = result;

        if (mounted) {
          setReady(true);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
        }
      });

    return () => {
      mounted = false;

      if (typeof cleanup === "function") {
        cleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    throw error;
  }

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
