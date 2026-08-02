import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import { RgoDialogHeader, type RgoDialogHeaderProps } from "@/components/feedback/RgoDialogHeader/RgoDialogHeader";
import { Box } from "@mui/material";

export function RgoDialogHeaderWithDifferentColorsDemo({ title = "Dialog Title", ...props }: RgoDialogHeaderProps) {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <RgoLabelBox label="Default (No color)">
        <RgoDialogHeader {...props} title={title} />
      </RgoLabelBox>
      <RgoLabelBox label="Primary color">
        <RgoDialogHeader {...props} title={title} color="primary" />
      </RgoLabelBox>
      <RgoLabelBox label="Secondary color">
        <RgoDialogHeader {...props} title={title} color="secondary" />
      </RgoLabelBox>
      <RgoLabelBox label="Error color">
        <RgoDialogHeader {...props} title={title} color="error" />
      </RgoLabelBox>
      <RgoLabelBox label="Success color">
        <RgoDialogHeader {...props} title={title} color="success" />
      </RgoLabelBox>
      <RgoLabelBox label="Warning color">
        <RgoDialogHeader {...props} title={title} color="warning" />
      </RgoLabelBox>
      <RgoLabelBox label="Info color">
        <RgoDialogHeader {...props} title={title} color="info" />
      </RgoLabelBox>
    </Box>
  );
}

export const RgoDialogHeaderWithDifferentColorsDemoCode = `
import { RgoLabelBox, RgoDialogHeader, type RgoDialogHeaderProps } from "@vireocodedev/starter-ui";
import { Box } from "@mui/material";

export function RgoDialogHeaderWithDifferentColorsDemo({ title = "Dialog Title", ...props }: RgoDialogHeaderProps) {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <RgoLabelBox label="Default (No color)">
        <RgoDialogHeader {...props} title={title} />
      </RgoLabelBox>
      <RgoLabelBox label="Primary color">
        <RgoDialogHeader {...props} title={title} color="primary" />
      </RgoLabelBox>
      <RgoLabelBox label="Secondary color">
        <RgoDialogHeader {...props} title={title} color="secondary" />
      </RgoLabelBox>
      <RgoLabelBox label="Error color">
        <RgoDialogHeader {...props} title={title} color="error" />
      </RgoLabelBox>
      <RgoLabelBox label="Success color">
        <RgoDialogHeader {...props} title={title} color="success" />
      </RgoLabelBox>
      <RgoLabelBox label="Warning color">
        <RgoDialogHeader {...props} title={title} color="warning" />
      </RgoLabelBox>
      <RgoLabelBox label="Info color">
        <RgoDialogHeader {...props} title={title} color="info" />
      </RgoLabelBox>
    </Box>
  );
}`;
