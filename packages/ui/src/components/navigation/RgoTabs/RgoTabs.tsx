import { VireoTabs, type VireoTabItem } from "@/core/components/navigation/VireoTabs";
import { useRgoTabs, type UseTabsProps } from "@/hooks/useRgoTabs/useRgoTabs";

export type RgoTabItem = { label: string; content: React.ReactNode; disabled?: boolean };
export type RgoTabsProps = { tabs: RgoTabItem[] } & UseTabsProps;

/** @deprecated Use VireoTabs. */
export function RgoTabs({ tabs, ...useTabsProps }: RgoTabsProps) {
  const { tab, onTabChange } = useRgoTabs(useTabsProps);
  const items: VireoTabItem[] = tabs.map((item, index) => ({ ...item, value: String(index) }));
  return <VireoTabs tabs={items} value={String(tab)} onChange={(value, event) => onTabChange(event, Number(value))} />;
}
