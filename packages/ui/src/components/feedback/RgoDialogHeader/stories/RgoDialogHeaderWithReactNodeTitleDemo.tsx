import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoDialogHeader, type RgoDialogHeaderProps } from "@/components/feedback/RgoDialogHeader/RgoDialogHeader";
import { Settings } from "@mui/icons-material";
import { Box, Chip } from "@mui/material";

export function RgoDialogHeaderWithReactNodeTitleDemo(props: Omit<RgoDialogHeaderProps, "title">) {
  const titleWithIcon = (
    <Box display="flex" alignItems="center" gap={1}>
      <Settings />
      Settings Dialog
    </Box>
  );

  const titleWithChipBadge = (
    <Box display="flex" alignItems="center" gap={1}>
      User Profile
      <Chip label="Premium" color="primary" size="small" />
    </Box>
  );

  const titleWithComplexContent = (
    <Box display="flex" flexDirection="column">
      <Box fontWeight={500}>Project Dashboard</Box>
      <Box fontSize="0.875rem" fontWeight={400} color="text.secondary">
        Last updated 2 hours ago
      </Box>
    </Box>
  );

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <RgoLabelBox label="Title with icon">
        <RgoDialogHeader {...props} title={titleWithIcon} />
      </RgoLabelBox>
      <RgoLabelBox label="Title with chip badge">
        <RgoDialogHeader {...props} title={titleWithChipBadge} />
      </RgoLabelBox>
      <RgoLabelBox label="Title with complex content">
        <RgoDialogHeader {...props} title={titleWithComplexContent} />
      </RgoLabelBox>
    </Box>
  );
}

export const RgoDialogHeaderWithReactNodeTitleDemoCode = `
import { RgoLabelBox, RgoDialogHeader, type RgoDialogHeaderProps } from "@vireocodedev/starter-ui";
import { Settings } from "@mui/icons-material";
import { Box, Chip } from "@mui/material";

export function RgoDialogHeaderWithReactNodeTitleDemo(props: Omit<RgoDialogHeaderProps, "title">) {
  const titleWithIcon = (
    <Box display="flex" alignItems="center" gap={1}>
      <Settings />
      Settings Dialog
    </Box>
  );

  const titleWithChipBadge = (
    <Box display="flex" alignItems="center" gap={1}>
      User Profile
      <Chip label="Premium" color="primary" size="small" />
    </Box>
  );

  const titleWithComplexContent = (
    <Box display="flex" flexDirection="column">
      <Box fontWeight={500}>Project Dashboard</Box>
      <Box fontSize="0.875rem" fontWeight={400} color="text.secondary">
        Last updated 2 hours ago
      </Box>
    </Box>
  );

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <RgoLabelBox label="Title with icon">
        <RgoDialogHeader {...props} title={titleWithIcon} />
      </RgoLabelBox>
      <RgoLabelBox label="Title with chip badge">
        <RgoDialogHeader {...props} title={titleWithChipBadge} />
      </RgoLabelBox>
      <RgoLabelBox label="Title with complex content">
        <RgoDialogHeader {...props} title={titleWithComplexContent} />
      </RgoLabelBox>
    </Box>
  );
}`;
