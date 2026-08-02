/**
 * Hook that tracks the pixel size of a container element via ResizeObserver.
 */

import type React from "react";
import { useEffect, useState } from "react";

export function useRgoContainerSize<T extends Element = HTMLDivElement>(ref: React.RefObject<T | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setSize(prev => (prev.width === width && prev.height === height ? prev : { width, height }));
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [ref]);

  return size;
}
