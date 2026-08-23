import { type StyledSlotComponent, type StyledSlotProps } from "@/core/public";
import { Box, type BoxProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import type React from "react";
import { VIREO_FORM_NAME } from "./VireoForm.identity";
import { type VireoFormOwnerState } from "./VireoForm.types";

type VireoFormStyledSlotProps = StyledSlotProps<VireoFormOwnerState>;
type VireoFormStyledSlotComponent<TProps extends object> = StyledSlotComponent<TProps, VireoFormOwnerState>;
type VireoFormRootProps = BoxProps & {
  noValidate?: boolean;
  onReset?: React.FormEventHandler<Element>;
  onSubmit?: React.SubmitEventHandler<Element>;
};

export const VireoFormRoot: VireoFormStyledSlotComponent<VireoFormRootProps> = styled(Box, {
  name: VIREO_FORM_NAME,
  slot: "Root",
  overridesResolver: ({ ownerState }, styles) => [
    styles.root,
    ownerState.dirty && styles.dirty,
    ownerState.submitting && styles.submitting,
    ownerState.validating && styles.validating,
    ownerState.invalid && styles.invalid,
  ],
})<VireoFormStyledSlotProps & VireoFormRootProps>(({ theme, ownerState }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
  marginInline: "auto",
  minWidth: 0,
  width: "100%",
  ...(ownerState.layoutWidth === "standard" && { maxWidth: "48rem" }),
  ...(ownerState.layoutWidth === "wide" && { maxWidth: "72rem" }),
  ...(ownerState.layoutWidth === "full" && { maxWidth: "none" }),
}));
