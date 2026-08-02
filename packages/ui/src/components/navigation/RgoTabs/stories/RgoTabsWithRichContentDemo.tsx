import { RgoTabs } from "@/components/navigation/RgoTabs/RgoTabs";
import { Card, CardContent, List, ListItem, ListItemText, Typography } from "@mui/material";

export function RgoTabsWithRichContentDemo() {
  return (
    <RgoTabs
      tabs={[
        {
          label: "Overview",
          content: (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overview
                </Typography>
                <Typography>This tab contains an overview with rich card content.</Typography>
              </CardContent>
            </Card>
          ),
        },
        {
          label: "Details",
          content: (
            <List>
              <ListItem>
                <ListItemText primary="Item 1" secondary="Description for item 1" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Item 2" secondary="Description for item 2" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Item 3" secondary="Description for item 3" />
              </ListItem>
            </List>
          ),
        },
      ]}
    />
  );
}

export const RgoTabsWithRichContentDemoCode = `
import { RgoTabs } from "@vireocodedev/starter-ui";
import { Card, CardContent, List, ListItem, ListItemText, Typography } from "@mui/material";

export function RgoTabsWithRichContentDemo() {
  return (
    <RgoTabs
      tabs={[
        {
          label: "Overview",
          content: (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Overview</Typography>
                <Typography>This tab contains an overview with rich card content.</Typography>
              </CardContent>
            </Card>
          ),
        },
        {
          label: "Details",
          content: (
            <List>
              <ListItem>
                <ListItemText primary="Item 1" secondary="Description for item 1" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Item 2" secondary="Description for item 2" />
              </ListItem>
            </List>
          ),
        },
      ]}
    />
  );
}`;
