import { useRgoDownloadFn } from "@/hooks/useRgoDownloadFn/useRgoDownloadFn";
import { Button, Paper, Stack, Typography } from "@mui/material";

export function UseRgoDownloadFnWithCsvStringDemo() {
  const download = useRgoDownloadFn();

  const handleDownload = () => {
    const csv = ["id,name,score", "1,Alice,42", "2,Bob,37", "3,Charlie,51"].join("\n");
    download({
      data: csv,
      preset: "csv",
      fileName: "sample-report",
    });
  };

  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        CSV download (string data)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Click the button to download an in-memory CSV string as <code>sample-report.csv</code>. The hook wraps the
        string in a Blob with the correct MIME and appends the extension automatically.
      </Typography>
      <Stack alignItems="flex-start">
        <Button variant="contained" onClick={handleDownload}>
          Download CSV
        </Button>
      </Stack>
    </Paper>
  );
}

export const UseRgoDownloadFnWithCsvStringDemoCode = `import { useRgoDownloadFn } from "@vireocodedev/starter-ui";
import { Button } from "@mui/material";

function Demo() {
  const download = useRgoDownloadFn();

  const handleDownload = () => {
    const csv = ["id,name,score", "1,Alice,42", "2,Bob,37"].join("\\n");
    download({
      data: csv,
      preset: "csv",
      fileName: "sample-report",
    });
  };

  return (
    <Button variant="contained" onClick={handleDownload}>
      Download CSV
    </Button>
  );
}`;
