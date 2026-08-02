import { useRgoTabs } from "@/hooks/useRgoTabs/useRgoTabs";
import { Tab, Tabs, Typography } from "@mui/material";

export function UseTabsWithUrlStateDemo() {
  const { tab, onTabChange, a11yProps, TabPanel } = useRgoTabs({
    useUrlForTabState: true,
  });

  return (
    <>
      <Tabs value={tab} onChange={onTabChange}>
        <Tab label="Tab One" {...a11yProps(0)} />
        <Tab label="Tab Two" {...a11yProps(1)} />
        <Tab label="Tab Three" {...a11yProps(2)} />
      </Tabs>
      <TabPanel value={tab} index={0}>
        <Typography variant="body1" sx={{ p: 2 }}>
          Content one
        </Typography>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <Typography variant="body1" sx={{ p: 2 }}>
          Content two
        </Typography>
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <Typography variant="body1" sx={{ p: 2 }}>
          Content three
        </Typography>
      </TabPanel>
    </>
  );
}

export const UseTabsWithUrlStateDemoCode = `
import { useRgoTabs } from "@vireocodedev/starter-ui";
import { Tab, Tabs, Typography } from "@mui/material";

export function UseTabsWithUrlStateDemo() {
  const { tab, onTabChange, a11yProps, TabPanel } = useRgoTabs({
    useUrlForTabState: true,
  });

  return (
    <>
      <Tabs value={tab} onChange={onTabChange}>
        <Tab label="Tab One" {...a11yProps(0)} />
        <Tab label="Tab Two" {...a11yProps(1)} />
        <Tab label="Tab Three" {...a11yProps(2)} />
      </Tabs>
      <TabPanel value={tab} index={0}>
        <Typography variant="body1" sx={{ p: 2 }}>
          Content one
        </Typography>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <Typography variant="body1" sx={{ p: 2 }}>
          Content two
        </Typography>
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <Typography variant="body1" sx={{ p: 2 }}>
          Content three
        </Typography>
      </TabPanel>
    </>
  );
}`;
