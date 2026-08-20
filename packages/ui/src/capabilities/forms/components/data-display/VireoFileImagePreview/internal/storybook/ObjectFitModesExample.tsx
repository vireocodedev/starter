import { Box, Stack, Typography } from "@mui/material";
import { VireoFileImagePreview } from "@vireocodedev/starter-ui/forms";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";

const imageFile = new File(
  [
    `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="300"><rect width="720" height="300" fill="#172554"/><circle cx="360" cy="150" r="95" fill="#38bdf8"/><path d="M180 260 310 130l90 90 75-75 100 115Z" fill="#a7f3d0"/></svg>`,
  ],
  "workspace-banner.svg",
  { type: "image/svg+xml" },
);

const modes = ["contain", "cover"] as const;

export default function ObjectFitModesExample() {
  return (
    <VireoStorybookProvider>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        {modes.map(mode => (
          <Box key={mode} sx={{ flex: 1, minWidth: 0 }}>
            <Typography color="text.secondary" variant="caption">
              {mode}
            </Typography>
            <VireoFileImagePreview
              file={imageFile}
              alt={`${mode} image preview`}
              objectFit={mode}
              sx={{ height: 180, mt: 0.5 }}
              slotProps={{ image: { sx: { height: "100%" } } }}
            />
          </Box>
        ))}
      </Stack>
    </VireoStorybookProvider>
  );
}
