// The shell's mobile nav uses the "dots-vertical" overflow icon. Consuming apps
// register their own icon set in @rgo/front-ui's RgoIconRegistry; this bundled
// augmentation only guarantees the icon the shell references is a valid key for
// the package's own typecheck. Not emitted to dist.
import type React from "react";

declare module "@rgo/front-ui" {
  interface RgoIconRegistry {
    "dots-vertical": React.ComponentType;
  }
}
