import { useRgoIcons } from "@/hooks/useRgoIcons/useRgoIcons";
import { RgoIconsProvider } from "@/providers/RgoIconsProvider/RgoIconsProvider";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import StarIcon from "@mui/icons-material/Star";
import { Box, Paper, type SvgIconProps, Typography } from "@mui/material";

const DEMO_ICONS = {
  home: HomeIcon,
  settings: SettingsIcon,
  star: StarIcon,
};

const IconsDisplay = () => {
  const { muiIconsMap } = useRgoIcons();

  return (
    <Box sx={{ display: "flex", gap: 3 }}>
      {Object.entries(muiIconsMap).map(([name, Icon]) => {
        const IconComp = Icon as React.ComponentType<SvgIconProps>;
        return (
          <Box key={name} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
            <IconComp fontSize="large" color="primary" />
            <Typography variant="caption">{name}</Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export const UseIconsWithDefaultPropsDemo = () => {
  return (
    <RgoIconsProvider icons={DEMO_ICONS}>
      <Paper elevation={1} sx={{ p: 3, maxWidth: 500 }}>
        <Typography variant="h6" gutterBottom>
          useRgoIcons Hook
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Accesses the icon map provided by <code>RgoIconsProvider</code>. Icons are registered by the consumer app via
          interface augmentation.
        </Typography>
        <IconsDisplay />
      </Paper>
    </RgoIconsProvider>
  );
};

export const UseIconsWithDefaultPropsDemoCode = `import { useRgoIcons } from "@vireocodedev/starter-ui";

function MyComponent() {
  const { muiIconsMap } = useRgoIcons();
  const HomeIcon = muiIconsMap.home;

  return <HomeIcon fontSize="large" color="primary" />;
}`;
