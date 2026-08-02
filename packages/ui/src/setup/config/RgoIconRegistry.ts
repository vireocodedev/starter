import { RgoIconCheckCircle } from "@/setup/config/icons/RgoIconCheckCircle";
import { RgoIconXCircle } from "@/setup/config/icons/RgoIconXCircle";

export const RGO_ICON_REGISTRY = {
  "check-circle": RgoIconCheckCircle,
  "x-circle": RgoIconXCircle,
} as const satisfies Record<string, React.ComponentType>;

export type RgoIconRegistryKey = keyof typeof RGO_ICON_REGISTRY;
