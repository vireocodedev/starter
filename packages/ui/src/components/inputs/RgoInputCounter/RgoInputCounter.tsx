import { VireoCounterInput, type VireoCounterInputProps } from "@/core/components/inputs/VireoCounterInput";
import React from "react";
export type RgoInputCounterProps = VireoCounterInputProps;
/** @deprecated Use VireoCounterInput. */
export const RgoInputCounter = React.forwardRef<HTMLInputElement, RgoInputCounterProps>(
  function RgoInputCounter(props, ref) {
    return <VireoCounterInput {...props} ref={ref} />;
  },
);
