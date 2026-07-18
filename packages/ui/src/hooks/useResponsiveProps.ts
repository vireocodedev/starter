// eslint-disable-next-line no-restricted-imports
import { useMediaQueryDevice } from "@/hooks/useMediaQueryDevice";

type DeepWritable<T> = {
  -readonly [K in keyof T]: DeepWritable<T[K]>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const UndefinedConstraintSentinel: unique symbol;

type UndefinedConstraint = typeof UndefinedConstraintSentinel;

export function useResponsiveProps<
  T = UndefinedConstraint,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const M extends T extends UndefinedConstraint ? Record<string, any> : T = T extends UndefinedConstraint
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Record<string, any>
    : T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const D extends T extends UndefinedConstraint ? Record<string, any> : T = T extends UndefinedConstraint
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Record<string, any>
    : T,
>(configMap: { mobile: M; desktop: D }): T extends UndefinedConstraint ? DeepWritable<M> | DeepWritable<D> : M | D {
  return useMediaQueryDevice().isMobile ? configMap.mobile : configMap.desktop;
}
