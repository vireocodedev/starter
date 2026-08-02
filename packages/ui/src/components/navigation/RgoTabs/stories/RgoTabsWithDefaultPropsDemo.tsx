import { RgoTabs, type RgoTabsProps } from "@/components/navigation/RgoTabs/RgoTabs";
import { Typography } from "@mui/material";

type RgoTabsWithDefaultPropsDemoProps = Partial<Omit<RgoTabsProps, "tabs">>;

export function RgoTabsWithDefaultPropsDemo(props: RgoTabsWithDefaultPropsDemoProps = {}) {
  return (
    <RgoTabs
      {...props}
      tabs={[
        { label: "Tab 1", content: <Typography>Content of Tab 1</Typography> },
        { label: "Tab 2", content: <Typography>Content of Tab 2</Typography> },
        { label: "Tab 3", content: <Typography>Content of Tab 3</Typography> },
      ]}
    />
  );
}

export const RgoTabsWithDefaultPropsDemoCode = `
import { RgoTabs } from "@vireocodedev/starter-ui";
import { Typography } from "@mui/material";

export function RgoTabsWithDefaultPropsDemo() {
  return (
    <RgoTabs
      tabs={[
        { label: "Tab 1", content: <Typography>Content of Tab 1</Typography> },
        { label: "Tab 2", content: <Typography>Content of Tab 2</Typography> },
        { label: "Tab 3", content: <Typography>Content of Tab 3</Typography> },
      ]}
    />
  );
}`;
