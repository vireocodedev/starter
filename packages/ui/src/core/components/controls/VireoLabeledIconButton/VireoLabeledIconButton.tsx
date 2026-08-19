import { VireoIcon } from "@/core/components/data-display/VireoIcon";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  type VireoLabeledIconButtonClassKey,
  getVireoLabeledIconButtonUtilityClass,
} from "./VireoLabeledIconButton.classes";
import { VIREO_LABELED_ICON_BUTTON_NAME, type VireoLabeledIconButtonSlotName } from "./VireoLabeledIconButton.identity";
import {
  VireoLabeledIconButtonLabel,
  VireoLabeledIconButtonRoot,
  VireoLabeledIconButtonStatusDot,
  VireoLabeledIconButtonVisual,
} from "./VireoLabeledIconButton.styled";
import {
  type VireoLabeledIconButtonOwnerState,
  type VireoLabeledIconButtonProps,
} from "./VireoLabeledIconButton.types";

function useUtilityClasses(_state: VireoLabeledIconButtonOwnerState, classes?: VireoLabeledIconButtonProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
      visual: ["visual"],
      statusDot: ["statusDot"],
      label: ["label"],
    } as const satisfies UtilityClassSlotMap<VireoLabeledIconButtonSlotName, VireoLabeledIconButtonClassKey>,
    getVireoLabeledIconButtonUtilityClass,
    classes,
  );
}

/** Renders a compact icon-over-label action with optional selected and status states. */
export const VireoLabeledIconButton = React.forwardRef<HTMLButtonElement, VireoLabeledIconButtonProps>(
  function VireoLabeledIconButton(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_LABELED_ICON_BUTTON_NAME });
    const {
      className,
      classes: classesProp,
      disabled = false,
      icon,
      label,
      selected = false,
      showStatusDot = false,
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;
    const state: VireoLabeledIconButtonOwnerState = { disabled, selected, showStatusDot, hasIcon: icon != null };
    const classes = useUtilityClasses(state, classesProp);
    const root = resolveSlotProps(slotProps.root, state);
    const visual = resolveSlotProps(slotProps.visual, state);
    const dot = resolveSlotProps(slotProps.statusDot, state);
    const labelProps = resolveSlotProps(slotProps.label, state);
    const { className: rc, ref: rr, style: rs, sx: rx, ...ro } = root;
    const { className: vc, ...vo } = visual;
    const { className: dc, ...dO } = dot;
    const { className: lc, ...lo } = labelProps;
    const ref = useForkRef(forwardedRef, rr);
    return (
      <VireoLabeledIconButtonRoot
        {...other}
        {...ro}
        as={slots.root}
        ref={ref}
        ownerState={state}
        disabled={disabled}
        aria-pressed={selected}
        className={joinClassNames(classes.root, className, rc)}
        style={{ ...style, ...rs }}
        sx={mergeSx(sx, rx)}
      >
        {(state.hasIcon || showStatusDot) && (
          <VireoLabeledIconButtonVisual
            {...vo}
            as={slots.visual ?? "span"}
            ownerState={state}
            className={joinClassNames(classes.visual, vc)}
          >
            {showStatusDot ? (
              <VireoLabeledIconButtonStatusDot
                {...dO}
                as={slots.statusDot ?? "span"}
                ownerState={state}
                className={joinClassNames(classes.statusDot, dc)}
                aria-hidden
              />
            ) : typeof icon === "string" ? (
              <VireoIcon icon={icon} aria-hidden />
            ) : (
              icon
            )}
          </VireoLabeledIconButtonVisual>
        )}
        <VireoLabeledIconButtonLabel
          {...lo}
          as={slots.label}
          ownerState={state}
          className={joinClassNames(classes.label, lc)}
        >
          {label}
        </VireoLabeledIconButtonLabel>
      </VireoLabeledIconButtonRoot>
    );
  },
);
VireoLabeledIconButton.displayName = VIREO_LABELED_ICON_BUTTON_NAME;
