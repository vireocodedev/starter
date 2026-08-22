import { useVireoPageLayout } from "@/capabilities/page-layout/hooks/useVireoPageLayout/useVireoPageLayout";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoPageHeaderClassKey, getVireoPageHeaderUtilityClass } from "./VireoPageHeader.classes";
import { VIREO_PAGE_HEADER_NAME, type VireoPageHeaderSlotName } from "./VireoPageHeader.identity";
import {
  VireoPageHeaderActions,
  VireoPageHeaderLeading,
  VireoPageHeaderRoot,
  VireoPageHeaderTitle,
} from "./VireoPageHeader.styled";
import type { VireoPageHeaderOwnerState, VireoPageHeaderProps } from "./VireoPageHeader.types";

function useUtilityClasses(classes?: VireoPageHeaderProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
      leading: ["leading"],
      title: ["title"],
      actions: ["actions"],
    } as const satisfies UtilityClassSlotMap<VireoPageHeaderSlotName, VireoPageHeaderClassKey>,
    getVireoPageHeaderUtilityClass,
    classes,
  );
}
/** Renders the standard page title row with optional leading navigation and trailing actions. */
export const VireoPageHeader = React.forwardRef<HTMLElement, VireoPageHeaderProps>(
  function VireoPageHeader(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_PAGE_HEADER_NAME });
    const {
      actions,
      className,
      classes: classesProp,
      leading,
      slotProps = {},
      slots = {},
      style,
      sx,
      title,
      ...other
    } = props;
    const layout = useVireoPageLayout();
    const ownerState: VireoPageHeaderOwnerState = {
      mode: layout.mode,
      hasLeading: leading != null,
      hasActions: actions != null,
    };
    const classes = useUtilityClasses(classesProp);
    const root = resolveSlotProps(slotProps.root, ownerState);
    const leadingProps = resolveSlotProps(slotProps.leading, ownerState);
    const titleProps = resolveSlotProps(slotProps.title, ownerState);
    const actionsProps = resolveSlotProps(slotProps.actions, ownerState);
    const ref = useForkRef(forwardedRef, root.ref);
    const Leading = slots.leading ?? VireoPageHeaderLeading;
    const Title = slots.title ?? VireoPageHeaderTitle;
    const Actions = slots.actions ?? VireoPageHeaderActions;
    return (
      <VireoPageHeaderRoot
        {...other}
        {...root}
        as={slots.root ?? "header"}
        ref={ref}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, root.className)}
        style={{ ...style, ...root.style }}
        sx={mergeSx(sx, root.sx)}
      >
        {leading != null && (
          <Leading
            {...leadingProps}
            ownerState={ownerState}
            className={joinClassNames(classes.leading, leadingProps.className)}
          >
            {leading}
          </Leading>
        )}
        {title != null && (
          <Title
            {...titleProps}
            ownerState={ownerState}
            variant="h6"
            fontWeight={600}
            noWrap
            className={joinClassNames(classes.title, titleProps.className)}
          >
            {title}
          </Title>
        )}
        {actions != null && (
          <Actions
            {...actionsProps}
            ownerState={ownerState}
            className={joinClassNames(classes.actions, actionsProps.className)}
          >
            {actions}
          </Actions>
        )}
      </VireoPageHeaderRoot>
    );
  },
);
VireoPageHeader.displayName = VIREO_PAGE_HEADER_NAME;
