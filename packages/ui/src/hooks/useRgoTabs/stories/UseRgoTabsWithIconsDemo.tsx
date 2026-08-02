import { useRgoTabs } from "@/hooks/useRgoTabs/useRgoTabs";
import { Dashboard, Notifications, Person, Settings } from "@mui/icons-material";
import { Tab, Tabs, Typography } from "@mui/material";

export function UseTabsWithIconsDemo() {
  const { tab, onTabChange, a11yProps, TabPanel } = useRgoTabs();

  return (
    <>
      <Tabs value={tab} onChange={onTabChange}>
        <Tab label="Dashboard" icon={<Dashboard />} {...a11yProps(0)} />
        <Tab label="Profile" icon={<Person />} {...a11yProps(1)} />
        <Tab label="Settings" icon={<Settings />} {...a11yProps(2)} />
        <Tab label="Notifications" icon={<Notifications />} {...a11yProps(3)} />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Typography variant="body1" sx={{ p: 2 }}>
          Dashboard with icon
        </Typography>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Typography variant="body1" sx={{ p: 2 }}>
          Profile with icon
        </Typography>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Typography variant="body1" sx={{ p: 2 }}>
          Settings with icon
        </Typography>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Typography variant="body1" sx={{ p: 2 }}>
          Notifications with icon
        </Typography>
      </TabPanel>
    </>
  );
}

export const UseTabsWithIconsDemoCode = `
import { useRgoTabs } from "@vireocodedev/starter-ui";
import { Dashboard, Notifications, Person, Settings } from "@mui/icons-material";
import { Tab, Tabs, Typography } from "@mui/material";

export function UseTabsWithIconsDemo() {
  const { tab, onTabChange, a11yProps, TabPanel } = useRgoTabs();

  return (
    <>
      <Tabs value={tab} onChange={onTabChange}>
        <Tab label="Dashboard" icon={<Dashboard />} {...a11yProps(0)} />
        <Tab label="Profile" icon={<Person />} {...a11yProps(1)} />
        <Tab label="Settings" icon={<Settings />} {...a11yProps(2)} />
        <Tab label="Notifications" icon={<Notifications />} {...a11yProps(3)} />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Typography variant="body1" sx={{ p: 2 }}>
          Dashboard with icon
        </Typography>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Typography variant="body1" sx={{ p: 2 }}>
          Profile with icon
        </Typography>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Typography variant="body1" sx={{ p: 2 }}>
          Settings with icon
        </Typography>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Typography variant="body1" sx={{ p: 2 }}>
          Notifications with icon
        </Typography>
      </TabPanel>
    </>
  );
}`;
