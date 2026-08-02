import { useRgoConfirm } from "@/hooks/useRgoConfirm/useRgoConfirm";
import { RgoConfirmProvider } from "@/providers/RgoConfirmProvider/RgoConfirmProvider";
import { Box, Button, Stack, Typography } from "@mui/material";

function Demo() {
  const confirm = useRgoConfirm();

  const showReactConfirm = () => {
    confirm({
      title: "React Content",
      message: (
        <Stack spacing={2}>
          <Typography variant="body1">This is a React component as content:</Typography>
          <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              • Custom React components
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Complex layouts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Interactive elements
            </Typography>
          </Box>
        </Stack>
      ),
      color: "info",
      maxWidth: "sm",
      onConfirm: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert("React content confirmed!");
      },
    });
  };

  return (
    <Stack alignItems="center">
      <Button variant="contained" color="info" onClick={showReactConfirm}>
        React Jsx Message
      </Button>
    </Stack>
  );
}

export function UseConfirmWithReactJsxMessageDemo() {
  return (
    <RgoConfirmProvider>
      <Demo />
    </RgoConfirmProvider>
  );
}

export const UseConfirmWithReactJsxMessageDemoCode = `
import { useRgoConfirm, RgoConfirmProvider } from "@vireocodedev/starter-ui";
import { Box, Button, Stack, Typography } from "@mui/material";

function Demo() {
  const confirm = useRgoConfirm();

  const showReactConfirm = () => {
    confirm({
      title: "React Content",
      message: (
        <Stack spacing={2}>
          <Typography variant="body1">This is a React component as content:</Typography>
          <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              • Custom React components
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Complex layouts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Interactive elements
            </Typography>
          </Box>
        </Stack>
      ),
      color: "info",
      maxWidth: "sm",
      onConfirm: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert("React content confirmed!");
      },
    });
  };

  return (
    <Stack alignItems="center">
      <Button variant="contained" color="info" onClick={showReactConfirm}>
        React Jsx Message
      </Button>
    </Stack>
  );
}

export function UseConfirmWithReactJsxMessageDemo() {
  return (
    <RgoConfirmProvider>
      <Demo />
    </RgoConfirmProvider>
  );
}`;
