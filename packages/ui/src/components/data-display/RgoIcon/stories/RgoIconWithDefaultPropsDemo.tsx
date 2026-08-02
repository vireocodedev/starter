import { RgoIcon } from "@/components/data-display/RgoIcon/RgoIcon";
import { RgoIconsProvider } from "@/providers/RgoIconsProvider/RgoIconsProvider";
import { Home, Settings, Star } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";

// Augment the icon registry for the demo
declare module "@/providers/RgoIconsProvider/RgoIconsProvider" {
  interface RgoIconRegistry {
    home: true;
    settings: true;
    star: true;
  }
}

const DEMO_ICONS = {
  home: Home,
  settings: Settings,
  star: Star,
};

export function RgoIconWithDefaultPropsDemo() {
  return (
    <RgoIconsProvider icons={DEMO_ICONS}>
      <Stack direction="row" spacing={3} alignItems="center">
        <Stack alignItems="center" spacing={1}>
          <RgoIcon icon="home" />
          <Typography variant="caption">home</Typography>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <RgoIcon icon="settings" />
          <Typography variant="caption">settings</Typography>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <RgoIcon icon="star" />
          <Typography variant="caption">star</Typography>
        </Stack>
      </Stack>
    </RgoIconsProvider>
  );
}

export const RgoIconWithDefaultPropsDemoCode = `
import { RgoIcon, RgoIconsProvider } from "@vireocodedev/starter-ui";
import { Home, Settings, Star } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";

// 1. Augment the icon registry in your app
declare module "@vireocodedev/starter-ui" {
  interface RgoIconRegistry {
    home: true;
    settings: true;
    star: true;
  }
}

// 2. Map icon names to MUI icon components
const icons = { home: Home, settings: Settings, star: Star };

// 3. Wrap your app with RgoIconsProvider
function App() {
  return (
    <RgoIconsProvider icons={icons}>
      <Stack direction="row" spacing={3} alignItems="center">
        <RgoIcon icon="home" />
        <RgoIcon icon="settings" />
        <RgoIcon icon="star" />
      </Stack>
    </RgoIconsProvider>
  );
}`;
