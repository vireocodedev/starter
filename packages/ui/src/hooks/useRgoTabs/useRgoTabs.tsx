import { useRgoUrlState } from "@/hooks/useRgoUrlState/useRgoUrlState";
import { Box } from "@mui/material";
import React from "react";

export type RgoTabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
  id: string;
};

// eslint-disable-next-line react-refresh/only-export-components
function RgoTabPanel(props: RgoTabPanelProps) {
  const { children, value, index, id, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`${id}panel-${index}`}
      aria-labelledby={`${id}-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const CURRENT_TAB_DEFAULT_KEY = "currentTab";

export type UseTabsProps = Partial<{
  useUrlForTabState: boolean;
  urlParamKey: string;
  initialTab: number;
}>;

export function useRgoTabs(props?: UseTabsProps) {
  const id = React.useId();
  const noopId = React.useId();
  const useUrlForTabState = props?.useUrlForTabState ?? false;
  const urlParamKey = useUrlForTabState ? (props?.urlParamKey ?? CURRENT_TAB_DEFAULT_KEY) : noopId;
  const initialTab = props?.initialTab ?? 0;
  const [tab, setTab] = React.useState(initialTab);
  const [tabFromUrl, setTabFromUrl] = useRgoUrlState(urlParamKey, initialTab);

  const onTabChange = (_: React.SyntheticEvent, newTab: number) => {
    if (useUrlForTabState) {
      setTabFromUrl(newTab);
    } else {
      setTab(newTab);
    }
  };

  const a11yProps = React.useCallback(
    (index: number) => {
      return {
        id: `${id}-${index}`,
        "aria-controls": `${id}panel-${index}`,
      };
    },
    [id],
  );

  const TabPanel = React.useCallback((props: Omit<RgoTabPanelProps, "id">) => <RgoTabPanel {...props} id={id} />, [id]);

  return {
    // id,
    tab: useUrlForTabState ? tabFromUrl : tab,
    onTabChange,
    a11yProps,
    TabPanel,
  };
}

/*

import { useRgoTabs } from "@vireocodedev/starter-ui";

function() {

  const { tab, onTabChange, a11yProps, TabPanel } = useRgoTabs({ useUrlForTabState: true });

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

*/
