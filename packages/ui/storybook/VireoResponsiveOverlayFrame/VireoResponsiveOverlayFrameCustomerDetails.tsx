import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import type React from "react";

export type VireoResponsiveOverlayFrameCustomerDetailsProps = {
  header: React.ReactNode;
  onClose: () => void;
};

/** Reusable customer-details content for responsive overlay examples. */
export function VireoResponsiveOverlayFrameCustomerDetails({
  header,
  onClose,
}: VireoResponsiveOverlayFrameCustomerDetailsProps) {
  return (
    <>
      {header}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              CUS-10482
            </Typography>
            <Typography variant="h5">Northstar Analytics</Typography>
          </Box>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Account status</Typography>
            <Chip label="Active" size="small" color="success" />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Annual value</Typography>
            <Typography fontWeight={700}>$48,600</Typography>
          </Stack>
        </Stack>
      </Box>
      <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained">Edit customer</Button>
      </Stack>
    </>
  );
}
