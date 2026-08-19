import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  type VireoSlidingScreenStackClassKey,
  getVireoSlidingScreenStackUtilityClass,
} from "./VireoSlidingScreenStack.classes";
import {
  VIREO_SLIDING_SCREEN_STACK_NAME,
  type VireoSlidingScreenStackSlotName,
} from "./VireoSlidingScreenStack.identity";
import {
  VireoSlidingScreenStackRoot,
  VireoSlidingScreenStackScreen,
  VireoSlidingScreenStackTrack,
} from "./VireoSlidingScreenStack.styled";
import {
  type VireoSlidingScreenStackOwnerState,
  type VireoSlidingScreenStackProps,
} from "./VireoSlidingScreenStack.types";
function useUtilityClasses(
  _ownerState: VireoSlidingScreenStackOwnerState,
  classes?: VireoSlidingScreenStackProps["classes"],
) {
  return composeClasses(
    { root: ["root"], track: ["track"], screen: ["screen"] } as const satisfies UtilityClassSlotMap<
      VireoSlidingScreenStackSlotName,
      VireoSlidingScreenStackClassKey
    >,
    getVireoSlidingScreenStackUtilityClass,
    classes,
  );
}
/** Animates a controlled collection of full-width screens along one horizontal track. */
export const VireoSlidingScreenStack = React.forwardRef<HTMLDivElement, VireoSlidingScreenStackProps>(
  function VireoSlidingScreenStack(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_SLIDING_SCREEN_STACK_NAME });
    const {
      activeScreen,
      className,
      classes: classesProp,
      screens,
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;
    const activeScreenIndex = Math.max(
      screens.findIndex(screen => screen.id === activeScreen),
      0,
    );
    const ownerState = { activeScreenIndex, screenCount: Math.max(screens.length, 1) };
    const classes = useUtilityClasses(ownerState, classesProp);
    const rootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const trackSlotProps = resolveSlotProps(slotProps.track, ownerState);
    const screenSlotProps = resolveSlotProps(slotProps.screen, ownerState);
    const { className: rootClassName, ref: rootRef, style: rootStyle, sx: rootSx, ...rootOther } = rootSlotProps;
    const { className: trackClassName, ...trackOther } = trackSlotProps;
    const { className: screenClassName, ...screenOther } = screenSlotProps;
    const ref = useForkRef(forwardedRef, rootRef);

    return (
      <VireoSlidingScreenStackRoot
        {...other}
        {...rootOther}
        as={slots.root ?? "div"}
        ref={ref}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootClassName)}
        style={{ ...style, ...rootStyle }}
        sx={mergeSx(sx, rootSx)}
      >
        <VireoSlidingScreenStackTrack
          {...trackOther}
          as={slots.track ?? "div"}
          ownerState={ownerState}
          className={joinClassNames(classes.track, trackClassName)}
          data-active-index={activeScreenIndex}
        >
          {screens.map((screen, index) => (
            <VireoSlidingScreenStackScreen
              {...screenOther}
              key={screen.id}
              as={slots.screen ?? "div"}
              ownerState={ownerState}
              className={joinClassNames(classes.screen, screenClassName)}
              aria-hidden={index !== activeScreenIndex}
              data-screen-id={screen.id}
            >
              {screen.children}
            </VireoSlidingScreenStackScreen>
          ))}
        </VireoSlidingScreenStackTrack>
      </VireoSlidingScreenStackRoot>
    );
  },
);
VireoSlidingScreenStack.displayName = VIREO_SLIDING_SCREEN_STACK_NAME;
