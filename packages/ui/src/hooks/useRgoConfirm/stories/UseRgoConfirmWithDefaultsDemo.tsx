import { useRgoConfirm } from "@/hooks/useRgoConfirm/useRgoConfirm";
import { RgoConfirmProvider } from "@/providers/RgoConfirmProvider/RgoConfirmProvider";
import { Delete } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";

function Demo() {
  const confirm = useRgoConfirm();

  const handleDelete = () => {
    confirm({
      title: "Delete Item",
      message: "Are you sure you want to delete this item?",
      color: "error",
      onConfirm: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert("Item deleted successfully!");
      },
    });
  };

  return (
    <Stack alignItems="center">
      <Button variant="contained" startIcon={<Delete />} color="error" onClick={handleDelete}>
        Delete Item
      </Button>
    </Stack>
  );
}

export function UseConfirmWithDefaultsDemo() {
  return (
    <RgoConfirmProvider>
      <Demo />
    </RgoConfirmProvider>
  );
}

export const UseConfirmWithDefaultsDemoCode = `
import { useRgoConfirm, RgoConfirmProvider } from "@vireocodedev/starter-ui";
import { Delete } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";

function Demo() {
  const confirm = useRgoConfirm();

  const handleDelete = () => {
    confirm({
      title: "Delete Item",
      message: "Are you sure you want to delete this item?",
      color: "error",
      onConfirm: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert("Item deleted successfully!");
      },
    });
  };

  return (
    <Stack alignItems="center">
      <Button variant="contained" startIcon={<Delete />} color="error" onClick={handleDelete}>
        Delete Item
      </Button>
    </Stack>
  );
}

export function UseConfirmWithDefaultsDemo() {
  return (
    <RgoConfirmProvider>
      <Demo />
    </RgoConfirmProvider>
  );
}`;
