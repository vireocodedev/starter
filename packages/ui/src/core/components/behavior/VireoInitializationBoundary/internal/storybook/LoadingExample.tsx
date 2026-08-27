import { VireoInitializationBoundary } from "@vireocodedev/ui";
import { VireoStorybookProvider } from "@vireocodedev/ui/storybook";
import { Paper } from "@mui/material";

export default function LoadingExample() {
  return (
    <VireoStorybookProvider>
      <Paper sx={{ alignItems: "center", display: "flex", justifyContent: "center", minHeight: 160, p: 3 }}>
        <VireoInitializationBoundary initialize={() => new Promise(() => undefined)} loadingLabel="Preparing workspace">
          Workspace ready
        </VireoInitializationBoundary>
      </Paper>
    </VireoStorybookProvider>
  );
}
