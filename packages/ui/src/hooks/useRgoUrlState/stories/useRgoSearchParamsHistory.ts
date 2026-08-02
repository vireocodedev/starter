import React from "react";
import { useLocation } from "react-use";

type HistoryEntry = [string, string][];
type HistoryEntryList = Array<HistoryEntry>;

export function useSearchParamsHistory() {
  const location = useLocation();
  const [history, setHistory] = React.useState<HistoryEntryList>([]);
  const isNavigating = React.useRef(false);
  const index = React.useRef(-1);
  const canGoBack = index.current > 0;
  const canGoForward = index.current < history.length - 1;
  const currentEntries = history[index.current] || [];
  const initialHistoryEntry = React.useRef<HistoryEntry | null>(null);

  React.useEffect(() => {
    // If we are navigating due to a history change, skip this effect.
    if (isNavigating.current) {
      isNavigating.current = false;
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const historyEntry = [...searchParams.entries()];

    if (!initialHistoryEntry.current) {
      initialHistoryEntry.current = historyEntry;
    }

    // Update history with the current search params
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, index.current + 1);
      newHistory.push(historyEntry);
      return newHistory;
    });

    index.current += 1;
  }, [location.search]);

  const setLocationFromHistory = (historyIndex: number) => {
    if (historyIndex < 0 || historyIndex >= history.length) return;

    const entries = history[historyIndex];
    const searchParams = new URLSearchParams();

    entries.forEach(([key, value]) => {
      searchParams.set(key, value);
    });

    index.current = historyIndex;
    isNavigating.current = true;
    window.history.replaceState(null, "", `?${searchParams.toString()}`);
  };

  const onBack = () => {
    if (!canGoBack) return;
    setLocationFromHistory(index.current - 1);
  };

  const onForward = () => {
    if (!canGoForward) return;
    setLocationFromHistory(index.current + 1);
  };

  const onRefresh = () => {
    setHistory([initialHistoryEntry.current!]);
    setLocationFromHistory(0);
  };

  return {
    currentEntries,
    onBack,
    onForward,
    onRefresh,
    canGoBack,
    canGoForward,
  };
}
