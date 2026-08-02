import { RgoInfiniteCanvasContext } from "@/components/layout/RgoInfiniteCanvas/RgoInfiniteCanvas";
import React from "react";

export const useRgoInfiniteCanvas = () => {
  const v = React.useContext(RgoInfiniteCanvasContext);
  if (!v) throw new Error("useRgoInfiniteCanvas must be used inside RgoInfiniteCanvas");
  return v;
};
