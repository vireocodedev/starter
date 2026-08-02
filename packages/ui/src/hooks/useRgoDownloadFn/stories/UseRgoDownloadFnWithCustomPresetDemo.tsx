import { useRgoDownloadFn } from "@/hooks/useRgoDownloadFn/useRgoDownloadFn";
import { Button, Paper, Stack, Typography } from "@mui/material";

export function UseRgoDownloadFnWithCustomPresetDemo() {
  const download = useRgoDownloadFn();

  const handleDownload = () => {
    const payload = JSON.stringify({ id: 1, name: "Alice", scores: [42, 37, 51] }, null, 2);
    download({
      data: payload,
      preset: { mimeType: "application/json;charset=utf-8;", extension: "json" },
      fileName: "user-profile",
    });
  };

  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        Custom preset (inline MIME + extension)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        When the built-in presets (<code>csv</code>, <code>xlsx</code>) don&apos;t fit, pass an inline preset object
        with <code>mimeType</code> and <code>extension</code>. Click to download a JSON file.
      </Typography>
      <Stack alignItems="flex-start">
        <Button variant="contained" onClick={handleDownload}>
          Download JSON
        </Button>
      </Stack>
    </Paper>
  );
}

export const UseRgoDownloadFnWithCustomPresetDemoCode = `import { useRgoDownloadFn } from "@vireocodedev/starter-ui";
import { Button } from "@mui/material";

function Demo() {
  const download = useRgoDownloadFn();

  const handleDownload = () => {
    const payload = JSON.stringify({ id: 1, name: "Alice" }, null, 2);
    download({
      data: payload,
      preset: { mimeType: "application/json;charset=utf-8;", extension: "json" },
      fileName: "user-profile",
    });
  };

  return (
    <Button variant="contained" onClick={handleDownload}>
      Download JSON
    </Button>
  );
}`;
