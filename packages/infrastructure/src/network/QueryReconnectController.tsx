import React from "react";

export type QueryReconnectControllerProps = {
  online: boolean;
  refetchActiveQueries: () => unknown | Promise<unknown>;
};

/** Refetches active queries after connectivity returns without rendering status UI. */
export function QueryReconnectController({ online, refetchActiveQueries }: QueryReconnectControllerProps) {
  const wasOfflineRef = React.useRef(!online);
  const refetchActiveQueriesRef = React.useRef(refetchActiveQueries);

  React.useEffect(() => {
    refetchActiveQueriesRef.current = refetchActiveQueries;
  }, [refetchActiveQueries]);

  React.useEffect(() => {
    if (!online) {
      wasOfflineRef.current = true;
      return;
    }

    if (!wasOfflineRef.current) {
      return;
    }

    wasOfflineRef.current = false;
    void Promise.resolve(refetchActiveQueriesRef.current()).catch(() => undefined);
  }, [online]);

  return null;
}
