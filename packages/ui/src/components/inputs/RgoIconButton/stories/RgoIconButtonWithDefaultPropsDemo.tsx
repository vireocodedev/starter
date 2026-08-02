import { RgoIconButton } from "@/components/inputs/RgoIconButton/RgoIconButton";
import { RgoIconsProvider } from "@/providers/RgoIconsProvider/RgoIconsProvider";
import { Home, Settings, Star } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import React from "react";

/**
 * Reuses the `home` / `settings` / `star` icon registry keys already declared by
 * the [RgoIcon](?path=/docs/components-data-display-rgoicon--docs) stories so the
 * registry shape stays consistent across Storybook (TypeScript module
 * augmentation is global).
 */
const DEMO_ICONS = {
  home: Home,
  settings: Settings,
  star: Star,
};

export function RgoIconButtonWithDefaultPropsDemo() {
  const [selected, setSelected] = React.useState<string | null>("home");

  return (
    <RgoIconsProvider icons={DEMO_ICONS}>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Default — clicking selects (label color jumps to `text.primary`).
          </Typography>
          <Stack direction="row" spacing={1}>
            <RgoIconButton
              icon="home"
              label="Home"
              selected={selected === "home"}
              onClick={() => setSelected("home")}
            />
            <RgoIconButton
              icon="settings"
              label="Settings"
              selected={selected === "settings"}
              onClick={() => setSelected("settings")}
            />
            <RgoIconButton
              icon="star"
              label="Star"
              selected={selected === "star"}
              onClick={() => setSelected("star")}
            />
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Disabled
          </Typography>
          <RgoIconButton icon="home" label="Home" disabled onClick={() => undefined} />
        </Stack>

        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary">
            Status-dot variant (renders a green dot in place of the icon — used for live indicators).
          </Typography>
          <RgoIconButton showStatusDot label="Notifications" onClick={() => undefined} />
        </Stack>
      </Stack>
    </RgoIconsProvider>
  );
}

export const RgoIconButtonWithDefaultPropsDemoCode = `
import { RgoIconButton, RgoIconsProvider } from "@vireocodedev/starter-ui";
import { Save, Search } from "@mui/icons-material";

declare module "@vireocodedev/starter-ui" {
  interface RgoIconRegistry {
    save: true;
    search: true;
  }
}

const icons = { save: Save, search: Search };

function Toolbar() {
  return (
    <RgoIconsProvider icons={icons}>
      {/* Standard icon + label */}
      <RgoIconButton icon="save" label="Save" onClick={onSave} />

      {/* "Selected" raises the label color to text.primary */}
      <RgoIconButton icon="search" label="Search" selected onClick={onSearch} />

      {/* Disabled state */}
      <RgoIconButton icon="save" label="Save" disabled onClick={onSave} />

      {/* Status-dot variant (no icon, green dot indicator) */}
      <RgoIconButton showStatusDot label="Notifications" onClick={onOpen} />
    </RgoIconsProvider>
  );
}`;
