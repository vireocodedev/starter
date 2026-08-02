import { useRgoConfirm } from "@/hooks/useRgoConfirm/useRgoConfirm";
import { RgoConfirmProvider } from "@/providers/RgoConfirmProvider/RgoConfirmProvider";
import { Button, Stack } from "@mui/material";

function Demo() {
  const confirm = useRgoConfirm();

  const showConfirm = (color: "error" | "primary" | "secondary" | "info" | "success" | "warning", action: string) => {
    confirm({
      title: `${action} Confirmation`,
      message: `This is a ${color} colored confirmation dialog. Do you want to proceed?`,
      confirmText: "Proceed",
      color,
      onConfirm: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(`${action} completed!`);
      },
    });
  };

  return (
    <Stack spacing={4} alignItems="center">
      <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
        <Button variant="contained" color="primary" onClick={() => showConfirm("primary", "Primary")}>
          Primary
        </Button>
        <Button variant="contained" color="secondary" onClick={() => showConfirm("secondary", "Secondary")}>
          Secondary
        </Button>
        <Button variant="contained" color="error" onClick={() => showConfirm("error", "Error")}>
          Error
        </Button>
        <Button variant="contained" color="warning" onClick={() => showConfirm("warning", "Warning")}>
          Warning
        </Button>
        <Button variant="contained" color="info" onClick={() => showConfirm("info", "Info")}>
          Info
        </Button>
        <Button variant="contained" color="success" onClick={() => showConfirm("success", "Success")}>
          Success
        </Button>
      </Stack>
    </Stack>
  );
}

export function UseConfirmWithColorsDemo() {
  return (
    <RgoConfirmProvider>
      <Demo />
    </RgoConfirmProvider>
  );
}

export const UseConfirmWithColorsDemoCode = `
import { useRgoConfirm, RgoConfirmProvider } from "@vireocodedev/starter-ui";
import { Button, Stack } from "@mui/material";

function Demo() {
  const confirm = useRgoConfirm();

  const showConfirm = (color: "error" | "primary" | "secondary" | "info" | "success" | "warning", action: string) => {
    confirm({
      title: \`\${action} Confirmation\`,
      message: \`This is a \${color} colored confirmation dialog. Do you want to proceed?\`,
      confirmText: "Proceed",
      color,
      onConfirm: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(\`\${action} completed!\`);
      },
    });
  };

  return (
    <Stack spacing={4} alignItems="center">
      <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
        <Button variant="contained" color="primary" onClick={() => showConfirm("primary", "Primary")}>
          Primary
        </Button>
        <Button variant="contained" color="secondary" onClick={() => showConfirm("secondary", "Secondary")}>
          Secondary
        </Button>
        <Button variant="contained" color="error" onClick={() => showConfirm("error", "Error")}>
          Error
        </Button>
        <Button variant="contained" color="warning" onClick={() => showConfirm("warning", "Warning")}>
          Warning
        </Button>
        <Button variant="contained" color="info" onClick={() => showConfirm("info", "Info")}>
          Info
        </Button>
        <Button variant="contained" color="success" onClick={() => showConfirm("success", "Success")}>
          Success
        </Button>
      </Stack>
    </Stack>
  );
}

export function UseConfirmWithColorsDemo() {
  return (
    <RgoConfirmProvider>
      <Demo />
    </RgoConfirmProvider>
  );
}`;
