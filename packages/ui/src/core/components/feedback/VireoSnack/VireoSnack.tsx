import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoSnackClassKey, getVireoSnackUtilityClass } from "./VireoSnack.classes";
import { VIREO_SNACK_NAME, type VireoSnackSlotName } from "./VireoSnack.identity";
import {
  VireoSnackEndAdornment,
  VireoSnackMessage,
  VireoSnackRoot,
  VireoSnackStartAdornment,
} from "./VireoSnack.styled";
import { type VireoSnackOwnerState, type VireoSnackProps } from "./VireoSnack.types";

function useUtilityClasses(_ownerState: VireoSnackOwnerState, classes?: VireoSnackProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
      startAdornment: ["startAdornment"],
      message: ["message"],
      endAdornment: ["endAdornment"],
    } as const satisfies UtilityClassSlotMap<VireoSnackSlotName, VireoSnackClassKey>,
    getVireoSnackUtilityClass,
    classes,
  );
}

/** Presents a compact semantic notification message with optional adornments. */
export const VireoSnack = React.forwardRef<HTMLDivElement, VireoSnackProps>(function VireoSnack(inProps, forwardedRef) {
  const props = useThemeProps({ props: inProps, name: VIREO_SNACK_NAME });
  const {
    className,
    classes: classesProp,
    endAdornment,
    message,
    slotProps = {},
    slots = {},
    startAdornment,
    style,
    sx,
    variant = "default",
    ...other
  } = props;
  const ownerState: VireoSnackOwnerState = {
    variant,
    hasStartAdornment: startAdornment != null,
    hasEndAdornment: endAdornment != null,
  };
  const classes = useUtilityClasses(ownerState, classesProp);
  const rootProps = resolveSlotProps(slotProps.root, ownerState);
  const startProps = resolveSlotProps(slotProps.startAdornment, ownerState);
  const messageProps = resolveSlotProps(slotProps.message, ownerState);
  const endProps = resolveSlotProps(slotProps.endAdornment, ownerState);
  const { className: rootClassName, ref: rootSlotRef, style: rootStyle, sx: rootSx, ...rootOther } = rootProps;
  const { className: startClassName, ...startOther } = startProps;
  const { className: messageClassName, ...messageOther } = messageProps;
  const { className: endClassName, ...endOther } = endProps;
  const rootRef = useForkRef(forwardedRef, rootSlotRef);

  return (
    <VireoSnackRoot
      {...other}
      {...rootOther}
      as={slots.root ?? "div"}
      ref={rootRef}
      ownerState={ownerState}
      role={variant === "error" ? "alert" : "status"}
      className={joinClassNames(classes.root, className, rootClassName)}
      style={{ ...style, ...rootStyle }}
      sx={mergeSx(sx, rootSx)}
    >
      {ownerState.hasStartAdornment && (
        <VireoSnackStartAdornment
          {...startOther}
          as={slots.startAdornment ?? "span"}
          ownerState={ownerState}
          className={joinClassNames(classes.startAdornment, startClassName)}
        >
          {startAdornment}
        </VireoSnackStartAdornment>
      )}
      <VireoSnackMessage
        {...messageOther}
        as={slots.message}
        ownerState={ownerState}
        className={joinClassNames(classes.message, messageClassName)}
      >
        {message}
      </VireoSnackMessage>
      {ownerState.hasEndAdornment && (
        <VireoSnackEndAdornment
          {...endOther}
          as={slots.endAdornment ?? "span"}
          ownerState={ownerState}
          className={joinClassNames(classes.endAdornment, endClassName)}
        >
          {endAdornment}
        </VireoSnackEndAdornment>
      )}
    </VireoSnackRoot>
  );
});

VireoSnack.displayName = VIREO_SNACK_NAME;
