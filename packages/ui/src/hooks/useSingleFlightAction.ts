import React from "react";

export function useSingleFlightAction<TKey>() {
  const pendingKeysRef = React.useRef(new Set<TKey>());

  return React.useCallback(async (key: TKey, action: () => Promise<unknown>): Promise<boolean> => {
    if (pendingKeysRef.current.has(key)) {
      return false;
    }

    pendingKeysRef.current.add(key);
    try {
      await action();
      return true;
    } finally {
      pendingKeysRef.current.delete(key);
    }
  }, []);
}
