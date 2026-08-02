import JSONCrush from "jsoncrush";
import React from "react";
import { useLocation } from "react-use";

export function useRgoUrlState<T>(key: string, defaultValue: T): [T, (newValue: T | ((prev: T) => T)) => void] {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedKey = React.useMemo(() => key, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedDefaultValue = React.useMemo(() => defaultValue, []);

  const getValueFromUrl = React.useCallback(
    (searchString: string | undefined): T => {
      try {
        const urlParams = new URLSearchParams(searchString);
        const raw = urlParams.get(memoizedKey);
        if (raw === null) return memoizedDefaultValue;
        const decompressed = JSONCrush.uncrush(decodeURIComponent(raw));
        const parsed = JSON.parse(decompressed);
        return parsed;
      } catch {
        return memoizedDefaultValue;
      }
    },
    [memoizedKey, memoizedDefaultValue],
  );

  const { search } = useLocation();
  const [state, setState] = React.useState<T>(() => getValueFromUrl(search));
  const isStateChange = React.useRef(false);

  // Sync state to URL when state changes
  React.useEffect(() => {
    try {
      const stateCompressed = JSONCrush.crush(JSON.stringify(state));
      const stateSerialized = encodeURIComponent(stateCompressed);
      const searchSerialized = new URLSearchParams(search).get(memoizedKey);
      const isSearchEqualToState = searchSerialized === stateSerialized;

      // If the search is equal to the state, no need to update the URL or React state
      if (isSearchEqualToState) return;

      if (isStateChange.current) {
        // Value changed through React state - should update URL to be in sync with React state
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set(memoizedKey, stateSerialized);
        const newUrlString = newUrl.toString();
        window.history.pushState(null, "", newUrlString);
      } else {
        // Value changed through URL (e.g., back/forward navigation) - should update React state to be in sync with URL
        setState(getValueFromUrl(search));
      }
    } catch {
      // Fail silently on serialization errors
    } finally {
      // Reset the state change flag after processing
      isStateChange.current = false;
    }
  }, [memoizedKey, state, search, getValueFromUrl]);

  // Handle popState event to keep state in sync with URL
  React.useEffect(() => {
    const onPopState = () => {
      setState(getValueFromUrl(search));
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [search, getValueFromUrl]);

  // Setter that accepts value or updater callback, mimicking useState API
  const setUrlState = React.useCallback((newValue: T | ((prev: T) => T)) => {
    setState(prev => {
      const value = newValue instanceof Function ? newValue(prev) : newValue;
      isStateChange.current = true;
      return value;
    });
  }, []);

  return [state, setUrlState];
}
