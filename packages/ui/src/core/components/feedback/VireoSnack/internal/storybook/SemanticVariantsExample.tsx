import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Stack, Typography } from "@mui/material";
import { VireoSnack, type VireoSnackVariant } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const variants: Array<{ variant: VireoSnackVariant; message: string; icon?: React.ReactNode }> = [
  { variant: "default", message: "Draft saved" },
  { variant: "info", message: "A new version is available", icon: <InfoOutlinedIcon fontSize="small" /> },
  { variant: "success", message: "Changes published", icon: <CheckCircleRoundedIcon fontSize="small" /> },
  { variant: "warning", message: "Connection is unstable", icon: <WarningAmberRoundedIcon fontSize="small" /> },
  { variant: "error", message: "Upload failed", icon: <WarningAmberRoundedIcon fontSize="small" /> },
];

export default function SemanticVariantsExample() {
  return (
    <VireoStorybookProvider>
      <Stack spacing={2} alignItems="flex-start">
        {variants.map(item => (
          <Stack key={item.variant} spacing={0.5}>
            <Typography color="text.secondary" variant="caption">
              {item.variant}
            </Typography>
            <VireoSnack variant={item.variant} message={item.message} startAdornment={item.icon} />
          </Stack>
        ))}
      </Stack>
    </VireoStorybookProvider>
  );
}
