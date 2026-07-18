import React from "react";

const EXPANDED_ROW_SCROLL_DELAY_MS = 250;

export function useMobileTableExpansion<TElement>({
  data,
  defaultExpanded,
  keyMapper,
}: {
  data: TElement[];
  defaultExpanded: boolean;
  keyMapper: (element: TElement) => React.Key;
}) {
  const [expandedByKey, setExpandedByKey] = React.useState<Record<string, boolean>>({});
  const accordionRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  React.useEffect(() => {
    setExpandedByKey(currentExpandedByKey => {
      const nextExpandedByKey: Record<string, boolean> = {};

      for (const element of data) {
        const key = String(keyMapper(element));
        nextExpandedByKey[key] = currentExpandedByKey[key] ?? defaultExpanded;
      }

      return nextExpandedByKey;
    });
  }, [data, defaultExpanded, keyMapper]);

  const setAccordionRef = React.useCallback((key: string, element: HTMLDivElement | null) => {
    accordionRefs.current[key] = element;
  }, []);

  const handleExpandedChange = React.useCallback((key: string, expanded: boolean) => {
    setExpandedByKey(currentExpandedByKey => ({
      ...currentExpandedByKey,
      [key]: expanded,
    }));

    if (expanded) {
      window.setTimeout(() => {
        accordionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, EXPANDED_ROW_SCROLL_DELAY_MS);
    }
  }, []);

  return {
    expandedByKey,
    handleExpandedChange,
    setAccordionRef,
  };
}
