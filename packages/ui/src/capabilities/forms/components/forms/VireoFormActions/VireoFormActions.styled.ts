import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { VIREO_FORM_ACTIONS_NAME } from "./VireoFormActions.identity";
import { type VireoFormActionsOwnerState } from "./VireoFormActions.types";

type VireoFormActionsStyledSlotProps = StyledSlotProps<VireoFormActionsOwnerState>;
type VireoFormActionsStyledSlotComponent<TProps extends object> = StyledSlotComponent<
  TProps,
  VireoFormActionsOwnerState
>;

export const VireoFormActionsRoot: VireoFormActionsStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_ACTIONS_NAME,
  slot: "Root",
  overridesResolver: (_props, styles) => styles.root,
})<VireoFormActionsStyledSlotProps>({
  containerName: "vireo-form-actions",
  containerType: "inline-size",
  minWidth: 0,
  width: "100%",
});

export const VireoFormActionsLayout: VireoFormActionsStyledSlotComponent<BoxProps> = styled(Box, {
  name: VIREO_FORM_ACTIONS_NAME,
  slot: "Layout",
  overridesResolver: (_props, styles) => styles.layout,
})<VireoFormActionsStyledSlotProps>(({ theme }) => ({
  alignItems: "stretch",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  minWidth: 0,
  "& > *": {
    width: "100%",
  },
  "@container vireo-form-actions (min-width: 30rem)": {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    "& > *": {
      width: "auto",
    },
  },
}));
