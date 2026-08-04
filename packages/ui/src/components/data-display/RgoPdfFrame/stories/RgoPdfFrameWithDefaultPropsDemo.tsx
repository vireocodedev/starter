import { RgoPdfFrame } from "@/components/data-display/RgoPdfFrame/RgoPdfFrame";
import { Button, Stack, Typography } from "@mui/material";
import React from "react";

const SAMPLE_PDF_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

export function RgoPdfFrameWithDefaultPropsDemo() {
  const [loading, setLoading] = React.useState(false);
  const [hideToolbar, setHideToolbar] = React.useState(false);

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1}>
        <Button variant={loading ? "contained" : "outlined"} onClick={() => setLoading(prev => !prev)}>
          {loading ? "Stop loading" : "Simulate loading"}
        </Button>
        <Button variant={hideToolbar ? "contained" : "outlined"} onClick={() => setHideToolbar(prev => !prev)}>
          {hideToolbar ? "Show toolbar" : "Hide toolbar"}
        </Button>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Built-in browser PDF viewer is used; appearance varies per browser.
      </Typography>

      <RgoPdfFrame url={SAMPLE_PDF_URL} loading={loading} hideToolbar={hideToolbar} height="60svh" />
    </Stack>
  );
}

export const RgoPdfFrameWithDefaultPropsDemoCode = `
import { RgoPdfFrame } from "@vireocodedev/starter-ui";

function MyPdfPreview({ url, isGenerating }: { url: string | null; isGenerating: boolean }) {
  return (
    <RgoPdfFrame
      // Pass null/undefined while still generating to show the loader
      url={url}
      loading={isGenerating}

      // PDF Open Parameters
      zoomPct={100}
      hideToolbar={false}

      // Sizing
      width="100%"
      height="70svh"
    />
  );
}

// With @react-pdf/renderer:
//   const [instance] = usePDF({ document: <MyDoc /> });
//   <RgoPdfFrame url={instance.url} loading={instance.loading} />`;
