import { useRgoTabs, type UseTabsProps } from "@/hooks/useRgoTabs/useRgoTabs";
import { Box, Tab, Tabs } from "@mui/material";

export type RgoTabItem = {
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
};

export type RgoTabsProps = {
  tabs: RgoTabItem[];
} & UseTabsProps;

export function RgoTabs({ tabs, ...useTabsProps }: RgoTabsProps) {
  const { tab, onTabChange, a11yProps, TabPanel } = useRgoTabs(useTabsProps);

  return (
    <>
      <Box mb={3}>
        <Tabs value={tab} onChange={onTabChange}>
          {tabs.map((item, index) => (
            <Tab key={index} label={item.label} {...a11yProps(index)} disabled={item.disabled} />
          ))}
        </Tabs>
      </Box>

      {tabs.map((item, index) => (
        <TabPanel key={index} value={tab} index={index}>
          {item.content}
        </TabPanel>
      ))}
    </>
  );
}
