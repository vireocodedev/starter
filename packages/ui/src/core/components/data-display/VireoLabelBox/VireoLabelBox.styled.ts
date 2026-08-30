import { type StyledSlotComponent, type StyledSlotProps } from "@/core/utils/muiutils";
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
    ...theme.typography.subtitle2,
    minWidth: 0,
    flex: ownerState.direction === "row" ? "0 1 auto" : undefined,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    fontWeight: ownerState.fontWeight,
    [COMPACT_CONTAINER_QUERY]: {
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      gap: theme.spacing(0.5),
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
  ...theme.typography.caption,
  marginLeft: "auto",
  color: theme.palette.text.secondary,
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
