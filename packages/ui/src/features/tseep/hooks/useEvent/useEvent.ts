import { type RgoEventSchema, type RgoEventSchemaKey } from "@/features/tseep/models/RgoEventSchema";
import { type RgoEventSchemaValue, rgoEventService } from "@/features/tseep/services/RgoEventService";
import React from "react";

export function useEvent<TEvent extends RgoEventSchemaKey>(
  key: TEvent,
  listener: RgoEventSchemaValue<RgoEventSchema[TEvent]>,
) {
  React.useEffect(() => {
    rgoEventService.on(key, listener);

    return () => {
      rgoEventService.off(key, listener);
    };
  }, [key, listener]);
}
