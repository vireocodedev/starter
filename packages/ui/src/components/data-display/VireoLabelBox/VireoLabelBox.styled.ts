import { type StyledSlotComponent, type StyledSlotProps } from "@/utils/muiutils";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_LABEL_BOX_NAME } from "./VireoLabelBox.identity";
import { type VireoLabelBoxOwnerState } from "./VireoLabelBox.types";

type VireoLabelBoxStyledSlotProps = StyledSlotProps<VireoLabelBoxOwnerState>;
type VireoLabelBoxStyledSlotComponent<TProps extends object> = StyledSlotComponent<TProps, VireoLabelBoxOwnerState>;

const COMPACT_CONTAINER_QUERY = "@container vireo-label-box (max-width: 480px)";

export const VireoLabelBoxRoot: VireoLabelBoxStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_LABEL_BOX_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoLabelBoxStyledSlotProps>(({ ownerState, theme }) => ({
  minWidth: 0,
  flex: 1,
  display: "flex",
  flexDirection: ownerState.direction,
  gap: theme.spacing(1),
  containerName: "vireo-label-box",
  containerType: "inline-size",
}));

export const VireoLabelBoxHeader: VireoLabelBoxStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_LABEL_BOX_NAME,
  slot: "Header",
  overridesResolver: (_props, styles) => styles.header,
})<VireoLabelBoxStyledSlotProps>(({ ownerState, theme }) =>
  theme.unstable_sx({
    minWidth: 0,
    minHeight: "1rem",
    flex: ownerState.direction === "row" ? "0 1 auto" : undefined,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
    fontSize: "0.875rem",
    fontWeight: ownerState.fontWeight,
    lineHeight: "1rem",
    [COMPACT_CONTAINER_QUERY]: {
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      gap: 0.5,
      ...(ownerState.direction === "row" && {
        flexBasis: "40%",
      }),
    },
  }),
);

export const VireoLabelBoxLabel: VireoLabelBoxStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_LABEL_BOX_NAME,
  slot: "Label",
  overridesResolver: (_props, styles) => styles.label,
})<VireoLabelBoxStyledSlotProps>(({ ownerState, theme }) => ({
  minWidth: 0,
  color: typeof ownerState.color === "function" ? ownerState.color(theme) : ownerState.color,
  overflowWrap: "anywhere",
}));

export const VireoLabelBoxRequiredIndicator: VireoLabelBoxStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_LABEL_BOX_NAME,
  slot: "RequiredIndicator",
  overridesResolver: (_props, styles) => styles.requiredIndicator,
})<VireoLabelBoxStyledSlotProps>({});

export const VireoLabelBoxHelperText: VireoLabelBoxStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_LABEL_BOX_NAME,
  slot: "HelperText",
  overridesResolver: (_props, styles) => styles.helperText,
})<VireoLabelBoxStyledSlotProps>(({ theme }) => ({
  marginLeft: "auto",
  color: theme.palette.text.secondary,
  fontSize: "0.75rem",
  fontWeight: 400,
  lineHeight: "1rem",
  overflowWrap: "anywhere",
  [COMPACT_CONTAINER_QUERY]: {
    marginLeft: 0,
  },
}));

export const VireoLabelBoxContent: VireoLabelBoxStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_LABEL_BOX_NAME,
  slot: "Content",
  overridesResolver: (_props, styles) => styles.content,
})<VireoLabelBoxStyledSlotProps>(({ theme }) => ({
  minWidth: 0,
  position: "relative",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
}));
