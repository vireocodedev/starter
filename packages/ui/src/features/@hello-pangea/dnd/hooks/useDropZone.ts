import { RgoDropZoneContext } from "@/features/@hello-pangea/dnd/providers/RgoDropZoneProvider";
import React from "react";

export function useDropZone() {
  const context = React.useContext(RgoDropZoneContext);
  if (context === undefined) throw new Error("useDropZone must be used within a LmsDropZoneProvider");
  return context;
}
