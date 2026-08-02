import { useRgoConfirm } from "@/hooks/useRgoConfirm/useRgoConfirm";
import { RgoConfirmProvider } from "@/providers/RgoConfirmProvider/RgoConfirmProvider";
import { Button, Stack } from "@mui/material";

function Demo() {
  const confirm = useRgoConfirm();

  const showConfirm = (maxWidth: "xs" | "sm" | "md" | "lg" | "xl", size: string) => {
    confirm({
      title: `${size} Dialog`,
      message: `This is a ${size.toLowerCase()} sized confirmation dialog. The content will adapt to the specified width constraint. This example shows how the dialog scales with different maxWidth values.`,
      maxWidth,
      onConfirm: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(`${size} dialog confirmed!`);
      },
    });
  };

  return (
    <Stack spacing={4} alignItems="center">
      <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
        <Button variant="outlined" onClick={() => showConfirm("xs", "Extra Small")}>
          XS Dialog
        </Button>
        <Button variant="outlined" onClick={() => showConfirm("sm", "Small")}>
          SM Dialog
        </Button>
        <Button variant="outlined" onClick={() => showConfirm("md", "Medium")}>
          MD Dialog
        </Button>
        <Button variant="outlined" onClick={() => showConfirm("lg", "Large")}>
          LG Dialog
        </Button>
        <Button variant="outlined" onClick={() => showConfirm("xl", "Extra Large")}>
          XL Dialog
        </Button>
      </Stack>
    </Stack>
  );
}

export function UseConfirmWithSizesDemo() {
  return (
    <RgoConfirmProvider>
      <Demo />
    </RgoConfirmProvider>
  );
}

export const UseConfirmWithSizesDemoCode = `
import { useRgoConfirm } from "@/hooks/useRgoConfirm/useRgoConfirm";
import { RgoConfirmProvider } from "@/providers/RgoConfirmProvider/RgoConfirmProvider";
import { Button, Stack } from "@mui/material";

function Demo() {
  const confirm = useRgoConfirm();

  const showConfirm = (maxWidth: "xs" | "sm" | "md" | "lg" | "xl", size: string) => {
    confirm({
      title: \`\${size} Dialog\`,
      message: \`This is a \${size.toLowerCase()} sized confirmation dialog. The content will adapt to the specified width constraint. This example shows how the dialog scales with different maxWidth values.\`,
      maxWidth,
      onConfirm: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(\`\${size} dialog confirmed!\`);
      },
    });
  };

  return (
    <Stack spacing={4} alignItems="center">
      <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
        <Button variant="outlined" onClick={() => showConfirm("xs", "Extra Small")}>
          XS Dialog
        </Button>
        <Button variant="outlined" onClick={() => showConfirm("sm", "Small")}>
          SM Dialog
        </Button>
        <Button variant="outlined" onClick={() => showConfirm("md", "Medium")}>
          MD Dialog
        </Button>
        <Button variant="outlined" onClick={() => showConfirm("lg", "Large")}>
          LG Dialog
        </Button>
        <Button variant="outlined" onClick={() => showConfirm("xl", "Extra Large")}>
          XL Dialog
        </Button>
      </Stack>
    </Stack>
  );
}

export function UseConfirmWithSizesDemo() {
  return (
    <RgoConfirmProvider>
      <Demo />
    </RgoConfirmProvider>
  );
}`;
