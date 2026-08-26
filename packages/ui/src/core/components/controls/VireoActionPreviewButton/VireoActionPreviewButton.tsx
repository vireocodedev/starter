import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  type VireoActionPreviewButtonClassKey,
  getVireoActionPreviewButtonUtilityClass,
} from "./VireoActionPreviewButton.classes";
import {
  VIREO_ACTION_PREVIEW_BUTTON_NAME,
  type VireoActionPreviewButtonSlotName,
} from "./VireoActionPreviewButton.identity";
import {
  VireoActionPreviewButtonContent,
  VireoActionPreviewButtonLabel,
  VireoActionPreviewButtonPreview,
  VireoActionPreviewButtonRoot,
} from "./VireoActionPreviewButton.styled";
import {
  type VireoActionPreviewButtonOwnerState,
  type VireoActionPreviewButtonProps,
} from "./VireoActionPreviewButton.types";

function useUtilityClasses(
  _ownerState: VireoActionPreviewButtonOwnerState,
  classes?: VireoActionPreviewButtonProps["classes"],
) {
  return composeClasses(
    {
      root: ["root"],
      content: ["content"],
      label: ["label"],
      preview: ["preview"],
    } as const satisfies UtilityClassSlotMap<VireoActionPreviewButtonSlotName, VireoActionPreviewButtonClassKey>,
    getVireoActionPreviewButtonUtilityClass,
    classes,
  );
}

/** Renders an action together with a concise preview of the consequence it will commit. */
export const VireoActionPreviewButton = React.forwardRef<HTMLButtonElement, VireoActionPreviewButtonProps>(
  function VireoActionPreviewButton(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_ACTION_PREVIEW_BUTTON_NAME });
    const {
      align = "start",
      "aria-describedby": ariaDescribedBy,
      "aria-label": ariaLabel,
      className,
      classes: classesProp,
      disabled = false,
      label,
      preview,
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;

    const ownerState: VireoActionPreviewButtonOwnerState = { align, disabled };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const {
      className: rootSlotClassName,
      "aria-describedby": rootSlotAriaDescribedBy,
      "aria-label": rootSlotAriaLabel,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const previewId = React.useId();
    const describedBy = [previewId, ariaDescribedBy, rootSlotAriaDescribedBy].filter(Boolean).join(" ");
    const { className: contentClassName, ...contentOther } = resolveSlotProps(slotProps.content, ownerState);
    const { className: labelClassName, ...labelOther } = resolveSlotProps(slotProps.label, ownerState);
    const { className: previewClassName, ...previewOther } = resolveSlotProps(slotProps.preview, ownerState);

    return (
      <VireoActionPreviewButtonRoot
        {...other}
        {...rootSlotOther}
        aria-describedby={describedBy}
        aria-label={rootSlotAriaLabel ?? ariaLabel ?? (typeof label === "string" ? label : undefined)}
        as={slots.root}
        ref={rootRef}
        ownerState={ownerState}
        disabled={disabled}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        <VireoActionPreviewButtonContent
          {...contentOther}
          as={slots.content ?? "span"}
          ownerState={ownerState}
          className={joinClassNames(classes.content, contentClassName)}
        >
          <VireoActionPreviewButtonLabel
            {...labelOther}
            as={slots.label ?? "span"}
            ownerState={ownerState}
            className={joinClassNames(classes.label, labelClassName)}
          >
            {label}
          </VireoActionPreviewButtonLabel>
          <VireoActionPreviewButtonPreview
            {...previewOther}
            id={previewId}
            as={slots.preview ?? "span"}
            ownerState={ownerState}
            className={joinClassNames(classes.preview, previewClassName)}
          >
            {preview}
          </VireoActionPreviewButtonPreview>
        </VireoActionPreviewButtonContent>
      </VireoActionPreviewButtonRoot>
    );
  },
);

VireoActionPreviewButton.displayName = VIREO_ACTION_PREVIEW_BUTTON_NAME;
