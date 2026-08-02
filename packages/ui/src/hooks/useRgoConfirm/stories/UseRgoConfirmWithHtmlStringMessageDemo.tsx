import { useRgoConfirm } from "@/hooks/useRgoConfirm/useRgoConfirm";
import { RgoConfirmProvider } from "@/providers/RgoConfirmProvider/RgoConfirmProvider";
import { Button, Stack } from "@mui/material";

function Demo() {
  const confirm = useRgoConfirm();

  const showHtmlConfirm = () => {
    confirm({
      title: "HTML Content",
      message:
        "This message contains <strong>HTML formatting</strong> including <em>italic text</em> and <u>underlined text</u>.",
      color: "warning",
      onConfirm: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert("HTML content confirmed!");
      },
    });
  };

  return (
    <Stack alignItems="center">
      <Button variant="contained" color="warning" onClick={showHtmlConfirm}>
        HTML String Message
      </Button>
    </Stack>
  );
}

export function UseConfirmWithHtmlStringMessageDemo() {
  return (
    <RgoConfirmProvider>
      <Demo />
    </RgoConfirmProvider>
  );
}

export const UseConfirmWithHtmlStringMessageDemoCode = `
import { useRgoConfirm, RgoConfirmProvider } from "@vireocodedev/starter-ui";
import { Button, Stack } from "@mui/material";

function Demo() {
  const confirm = useRgoConfirm();

  const showHtmlConfirm = () => {
    confirm({
      title: "HTML Content",
      message:
        "This message contains <strong>HTML formatting</strong> including <em>italic text</em> and <u>underlined text</u>.",
      color: "warning",
      onConfirm: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert("HTML content confirmed!");
      },
    });
  };

  return (
    <Stack alignItems="center">
      <Button variant="contained" color="warning" onClick={showHtmlConfirm}>
        HTML String Message
      </Button>
    </Stack>
  );
}

export function UseConfirmWithHtmlStringMessageDemo() {
  return (
    <RgoConfirmProvider>
      <Demo />
    </RgoConfirmProvider>
  );
}`;
