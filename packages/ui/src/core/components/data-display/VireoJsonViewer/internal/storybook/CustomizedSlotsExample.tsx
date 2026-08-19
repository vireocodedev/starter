import { VireoJsonViewer } from "@vireocodedev/starter-ui";
import { VireoStorybookProvider } from "@vireocodedev/starter-ui/storybook";
import { CodeRounded } from "@mui/icons-material";

export default function CustomizedSlotsExample() {
  return (
    <VireoStorybookProvider>
      <VireoJsonViewer
        data={{ requestId: "req_01J5V8JH28X7K3P1", status: "failed" }}
        copyLabel="Copy JSON to clipboard"
        copiedLabel="JSON copied"
        slots={{ root: "section", copyIcon: CodeRounded }}
        slotProps={{
          root: {
            "aria-label": "Customized diagnostic payload",
            sx: { borderColor: "primary.main", borderWidth: 2, boxShadow: 3 },
          },
          toolbar: { sx: { top: 8, right: 8 } },
          copyButton: { color: "primary" },
          content: { sx: { pt: 5, backgroundColor: "action.hover" } },
        }}
      />
    </VireoStorybookProvider>
  );
}
