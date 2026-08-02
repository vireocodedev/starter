import { useRgoDownloadFn } from "@/hooks/useRgoDownloadFn/useRgoDownloadFn";
import { Button, Paper, Stack, Typography } from "@mui/material";

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function UseRgoDownloadFnWithXlsxBlobDemo() {
  const download = useRgoDownloadFn();

  const handleDownload = () => {
    // Normally this Blob would come from a backend endpoint that returns a real xlsx file.
    // For demo purposes we just create a placeholder Blob with the correct MIME type.
    const blob = new Blob(["This is a placeholder for binary xlsx content."], { type: XLSX_MIME });
    download({
      data: blob,
      preset: "xlsx",
      fileName: "sample-report",
    });
  };

  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        XLSX download (Blob data)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        When the data is already a <code>Blob</code> with the matching MIME type, the hook reuses it directly without
        re-wrapping. Click to download <code>sample-report.xlsx</code>.
      </Typography>
      <Stack alignItems="flex-start">
        <Button variant="contained" onClick={handleDownload}>
          Download XLSX
        </Button>
      </Stack>
    </Paper>
  );
}

export const UseRgoDownloadFnWithXlsxBlobDemoCode = `import { useRgoDownloadFn } from "@vireocodedev/starter-ui";
import { Button } from "@mui/material";

function Demo() {
  const download = useRgoDownloadFn();

  const handleDownload = async () => {
    // In a real app this Blob would come from a backend endpoint.
    const blob = await fetchXlsxFromBackend();
    download({
      data: blob,
      preset: "xlsx",
      fileName: "sample-report",
    });
  };

  return (
    <Button variant="contained" onClick={handleDownload}>
      Download XLSX
    </Button>
  );
}`;
