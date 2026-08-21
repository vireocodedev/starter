import { Box } from "@mui/material";

export function HistoryHoverableTableRow({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <Box
      component="div"
      sx={{
        "&:hover": {
          backgroundColor: "action.hover",
        },
      }}
    >
      {children}
    </Box>
  );
}
