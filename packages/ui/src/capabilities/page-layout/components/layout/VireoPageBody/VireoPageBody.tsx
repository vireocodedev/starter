import { useVireoPageLayout } from "@/capabilities/page-layout/hooks/useVireoPageLayout/useVireoPageLayout";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoPageBodyClassKey, getVireoPageBodyUtilityClass } from "./VireoPageBody.classes";
import { VIREO_PAGE_BODY_NAME, type VireoPageBodySlotName } from "./VireoPageBody.identity";
import {
  VireoPageBodyContainer,
  VireoPageBodyContent,
  VireoPageBodyDrawer,
  VireoPageBodyRoot,
} from "./VireoPageBody.styled";
import type { VireoPageBodyOwnerState, VireoPageBodyProps } from "./VireoPageBody.types";

function useUtilityClasses(classes?: VireoPageBodyProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
      content: ["content"],
      container: ["container"],
      drawer: ["drawer"],
    } as const satisfies UtilityClassSlotMap<VireoPageBodySlotName, VireoPageBodyClassKey>,
    getVireoPageBodyUtilityClass,
    classes,
  );
}

/** Supplies the standard scrolling page content region and optional sibling drawer. */
export const VireoPageBody = React.forwardRef<HTMLDivElement, VireoPageBodyProps>(
  function VireoPageBody(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_PAGE_BODY_NAME });
    const {
      children,
      className,
      classes: classesProp,
      compactPadding = 2,
      drawer,
      maxWidth = false,
      paddingOnCompact = false,
      regularPadding = 3,
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;
    const layout = useVireoPageLayout();
    const ownerState: VireoPageBodyOwnerState = { mode: layout.mode, paddingOnCompact };
    const classes = useUtilityClasses(classesProp);
    const root = resolveSlotProps(slotProps.root, ownerState);
    const content = resolveSlotProps(slotProps.content, ownerState);
    const container = resolveSlotProps(slotProps.container, ownerState);
    const drawerSlot = resolveSlotProps(slotProps.drawer, ownerState);
    const ref = useForkRef(forwardedRef, root.ref);
    const Content = slots.content ?? VireoPageBodyContent;
    const Container = slots.container ?? VireoPageBodyContainer;
    const Drawer = slots.drawer ?? VireoPageBodyDrawer;
    const padding = layout.isCompact ? (paddingOnCompact ? compactPadding : 0) : regularPadding;
    return (
      <VireoPageBodyRoot
        {...other}
        {...root}
        as={slots.root ?? "div"}
        ref={ref}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, root.className)}
        style={{ ...style, ...root.style }}
        sx={mergeSx(sx, root.sx)}
      >
        <Content {...content} ownerState={ownerState} className={joinClassNames(classes.content, content.className)}>
          <Container
            disableGutters
            {...container}
            ownerState={ownerState}
            maxWidth={maxWidth}
            className={joinClassNames(classes.container, container.className)}
            sx={mergeSx({ p: padding }, container.sx)}
          >
            {children}
          </Container>
        </Content>
        {drawer != null && (
          <Drawer
            {...drawerSlot}
            as={slots.drawer ?? "aside"}
            ownerState={ownerState}
            className={joinClassNames(classes.drawer, drawerSlot.className)}
          >
            {drawer}
          </Drawer>
        )}
      </VireoPageBodyRoot>
    );
  },
);
VireoPageBody.displayName = VIREO_PAGE_BODY_NAME;
