import { RgoIcon } from "@/components/data-display/RgoIcon/RgoIcon";
import { RgoIconsProvider } from "@/providers/RgoIconsProvider/RgoIconsProvider";
import { Home, Settings, Star } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";

const DEMO_ICONS = {
  home: Home,
  settings: Settings,
  star: Star,
};

export function RgoIconWithCustomStylingDemo() {
  return (
    <RgoIconsProvider icons={DEMO_ICONS}>
      <Stack direction="row" spacing={3} alignItems="center">
        <Stack alignItems="center" spacing={1}>
          <RgoIcon icon="home" width={16} height={16} />
          <Typography variant="caption">16px</Typography>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <RgoIcon icon="home" width={24} height={24} />
          <Typography variant="caption">24px (default)</Typography>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <RgoIcon icon="home" width={36} height={36} />
          <Typography variant="caption">36px</Typography>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <RgoIcon icon="home" width={48} height={48} sx={{ color: "primary.main" }} />
          <Typography variant="caption">48px colored</Typography>
        </Stack>
      </Stack>
    </RgoIconsProvider>
  );
}

export const RgoIconWithCustomStylingDemoCode = `
import { RgoIcon, RgoIconsProvider } from "@vireocodedev/starter-ui";
import { Home } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";

const icons = { home: Home };

export function RgoIconWithCustomStylingDemo() {
  return (
    <RgoIconsProvider icons={icons}>
      <Stack direction="row" spacing={3} alignItems="center">
        <RgoIcon icon="home" width={16} height={16} />
        <RgoIcon icon="home" width={24} height={24} />
        <RgoIcon icon="home" width={36} height={36} />
        <RgoIcon icon="home" width={48} height={48} sx={{ color: "primary.main" }} />
      </Stack>
    </RgoIconsProvider>
  );
}`;
