import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { type RgoDialogHeaderProps, RgoDialogHeader } from "@/components/feedback/RgoDialogHeader/RgoDialogHeader";
import { Delete, Edit, Settings } from "@mui/icons-material";
import { Box, Button, Chip } from "@mui/material";

export function RgoDialogHeaderWithChildrenDemo({ title = "Dialog Title", ...props }: RgoDialogHeaderProps) {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <RgoLabelBox label="Single action button">
        <RgoDialogHeader {...props} title={title}>
          <Button size="small" startIcon={<Edit />}>
            Edit
          </Button>
        </RgoDialogHeader>
      </RgoLabelBox>
      <RgoLabelBox label="Multiple action buttons">
        <RgoDialogHeader {...props} title={title}>
          <Button size="small" startIcon={<Edit />}>
            Edit
          </Button>
          <Button size="small" startIcon={<Settings />}>
            Settings
          </Button>
          <Button size="small" startIcon={<Delete />} color="error">
            Delete
          </Button>
        </RgoDialogHeader>
      </RgoLabelBox>
      <RgoLabelBox label="With status chips">
        <RgoDialogHeader {...props} title={title}>
          <Chip label="Active" color="success" size="small" />
          <Chip label="Priority" color="warning" size="small" />
          <Button size="small" startIcon={<Edit />}>
            Edit
          </Button>
        </RgoDialogHeader>
      </RgoLabelBox>
    </Box>
  );
}

export const RgoDialogHeaderWithChildrenDemoCode = `
import { RgoLabelBox, type RgoDialogHeaderProps, RgoDialogHeader } from "@vireocodedev/starter-ui";
import { Delete, Edit, Settings } from "@mui/icons-material";
import { Box, Button, Chip } from "@mui/material";

export function RgoDialogHeaderWithChildrenDemo({ title = "Dialog Title", ...props }: RgoDialogHeaderProps) {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <RgoLabelBox label="Single action button">
        <RgoDialogHeader {...props} title={title}>
          <Button size="small" startIcon={<Edit />}>
            Edit
          </Button>
        </RgoDialogHeader>
      </RgoLabelBox>
      <RgoLabelBox label="Multiple action buttons">
        <RgoDialogHeader {...props} title={title}>
          <Button size="small" startIcon={<Edit />}>
            Edit
          </Button>
          <Button size="small" startIcon={<Settings />}>
            Settings
          </Button>
          <Button size="small" startIcon={<Delete />} color="error">
            Delete
          </Button>
        </RgoDialogHeader>
      </RgoLabelBox>
      <RgoLabelBox label="With status chips">
        <RgoDialogHeader {...props} title={title}>
          <Chip label="Active" color="success" size="small" />
          <Chip label="Priority" color="warning" size="small" />
          <Button size="small" startIcon={<Edit />}>
            Edit
          </Button>
        </RgoDialogHeader>
      </RgoLabelBox>
    </Box>
  );
}`;
