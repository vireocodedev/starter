import React from "react";

interface DelayedRenderProps {
  /** Time to wait in milliseconds before rendering children. Defaults to 250ms. */
  delay?: number;
  /** The skeleton or loader component that is waiting to be shown. */
  children: React.ReactNode;
}

export function DelayedRender({ delay = 200, children }: DelayedRenderProps) {
  const [shouldRender, setShouldRender] = React.useState(false);

  React.useEffect(() => {
    // Start the countdown immediately upon mounting
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, delay);

    // If the parent component unmounts this before the timer fires,
    // we clear it out to prevent memory leaks and state updates.
    return () => clearTimeout(timer);
  }, [delay]);

  // Returns null (renders absolutely nothing) during the brief buffer window
  if (!shouldRender) {
    return null;
  }

  return <>{children}</>;
}
