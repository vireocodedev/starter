import { type AppShellNavSlotConfig } from "@/config/app.config.types";
import { type NavSlotEntry } from "@/shell/layout/nav/nav.types";

export function AppNavSlotItem({
  entry,
  index,
  isCollapsed,
  mobile,
  onNavigate,
  slot,
}: {
  entry: NavSlotEntry;
  index: number;
  isCollapsed: boolean;
  mobile: boolean;
  onNavigate?: () => void;
  slot: AppShellNavSlotConfig;
}) {
  const SlotComponent = slot.Component;

  return (
    <SlotComponent key={`slot-${entry.id}-${index}`} collapsed={isCollapsed} mobile={mobile} onNavigate={onNavigate} />
  );
}
