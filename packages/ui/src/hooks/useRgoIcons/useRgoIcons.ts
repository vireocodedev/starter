import { RgoIconsContext } from "@/providers/RgoIconsProvider/RgoIconsProvider";
import React from "react";

export function useRgoIcons() {
  const context = React.useContext(RgoIconsContext);
  if (!context) throw new Error("useIconComponent must be used within a RgoIconProvider");
  return context;
}
