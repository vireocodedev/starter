import { RgoTabs } from "@/components/navigation/RgoTabs/RgoTabs";
import { Typography } from "@mui/material";

export function RgoTabsWithInitialTabDemo() {
  return (
    <RgoTabs
      initialTab={1}
      tabs={[
        { label: "Tab 1", content: <Typography>Content of Tab 1</Typography> },
        { label: "Tab 2", content: <Typography>Content of Tab 2 (initially selected)</Typography> },
        { label: "Tab 3", content: <Typography>Content of Tab 3</Typography> },
      ]}
    />
  );
}

export const RgoTabsWithInitialTabDemoCode = `
import { RgoTabs } from "@vireocodedev/starter-ui";
import { Typography } from "@mui/material";

export function RgoTabsWithInitialTabDemo() {
  return (
    <RgoTabs
      initialTab={1}
      tabs={[
        { label: "Tab 1", content: <Typography>Content of Tab 1</Typography> },
        { label: "Tab 2", content: <Typography>Content of Tab 2 (initially selected)</Typography> },
        { label: "Tab 3", content: <Typography>Content of Tab 3</Typography> },
      ]}
    />
  );
}`;
