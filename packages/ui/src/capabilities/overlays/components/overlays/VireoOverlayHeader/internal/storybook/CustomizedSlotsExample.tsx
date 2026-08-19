import { VireoOverlayHeader } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import MoreVert from "@mui/icons-material/MoreVert";
import { Box, Chip } from "@mui/material";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <Box sx={{ width: "100%", border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <VireoOverlayHeader
          title="Edit invoice"
          actions={<Chip label="Customized" size="small" />}
          closeLabel="Close customized overlay"
          onClose={() => {}}
          slots={{ root: "section", closeIcon: MoreVert }}
          slotProps={{
            root: { "aria-label": "Customized overlay header", sx: { borderBottomStyle: "dashed" } },
            title: { sx: { color: "primary.main", fontWeight: 700 } },
            closeButton: { color: "primary" },
          }}
        />
        <Box sx={{ minHeight: 160, p: 3, color: "text.secondary" }}>Overlay content starts here.</Box>
      </Box>
    </VireoStorybookProvider>
  );
}
