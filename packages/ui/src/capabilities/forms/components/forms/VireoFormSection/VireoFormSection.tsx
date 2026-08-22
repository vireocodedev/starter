import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { getVireoFormSectionUtilityClass, type VireoFormSectionClassKey } from "./VireoFormSection.classes";
import { VIREO_FORM_SECTION_NAME, type VireoFormSectionSlotName } from "./VireoFormSection.identity";
import {
  VireoFormSectionContent,
  VireoFormSectionDescription,
  VireoFormSectionHeader,
  VireoFormSectionLabel,
  VireoFormSectionLayout,
  VireoFormSectionRoot,
} from "./VireoFormSection.styled";
import type { VireoFormSectionOwnerState, VireoFormSectionProps } from "./VireoFormSection.types";

function useUtilityClasses(_ownerState: VireoFormSectionOwnerState, classes?: VireoFormSectionProps["classes"]) {
  return composeClasses(
    {
      root: ["root"],
      header: ["header"],
      label: ["label"],
      description: ["description"],
      content: ["content"],
      layout: ["layout"],
    } as const satisfies UtilityClassSlotMap<VireoFormSectionSlotName, VireoFormSectionClassKey>,
    getVireoFormSectionUtilityClass,
    classes,
  );
}

/** Groups related form content under an accessible heading and a container-responsive layout. */
export const VireoFormSection = React.forwardRef<HTMLElement, VireoFormSectionProps>(
  function VireoFormSection(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_SECTION_NAME });
    const {
      children,
      className,
      classes: classesProp,
      description,
      headingLevel = 2,
      label,
      layout = "grid",
      maxColumns = 2,
      slotProps = {},
      slots = {},
      style,
      sx,
      variant = "outlined",
      ...other
    } = props;
    const ownerState: VireoFormSectionOwnerState = {
      hasDescription: description !== undefined && description !== null,
      headingLevel,
      layout,
      maxColumns,
      variant,
    };
    const classes = useUtilityClasses(ownerState, classesProp);
    const generatedId = React.useId();
    const generatedHeadingId = `${generatedId}-heading`;
    const generatedDescriptionId = `${generatedId}-description`;

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const resolvedHeaderSlotProps = resolveSlotProps(slotProps.header, ownerState);
    const resolvedLabelSlotProps = resolveSlotProps(slotProps.label, ownerState);
    const resolvedDescriptionSlotProps = resolveSlotProps(slotProps.description, ownerState);
    const resolvedContentSlotProps = resolveSlotProps(slotProps.content, ownerState);
    const resolvedLayoutSlotProps = resolveSlotProps(slotProps.layout, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const { className: headerSlotClassName, ...headerSlotOther } = resolvedHeaderSlotProps;
    const { className: labelSlotClassName, id: labelSlotId, ...labelSlotOther } = resolvedLabelSlotProps;
    const {
      className: descriptionSlotClassName,
      id: descriptionSlotId,
      ...descriptionSlotOther
    } = resolvedDescriptionSlotProps;
    const { className: contentSlotClassName, ...contentSlotOther } = resolvedContentSlotProps;
    const { className: layoutSlotClassName, ...layoutSlotOther } = resolvedLayoutSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const headingId = labelSlotId ?? generatedHeadingId;
    const descriptionId = descriptionSlotId ?? generatedDescriptionId;
    const headingTag = `h${headingLevel}` as `h${VireoFormSectionOwnerState["headingLevel"]}`;

    return (
      <VireoFormSectionRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "section"}
        ref={rootRef}
        ownerState={ownerState}
        aria-labelledby={headingId}
        aria-describedby={ownerState.hasDescription ? descriptionId : undefined}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        <VireoFormSectionHeader
          {...headerSlotOther}
          as={slots.header}
          ownerState={ownerState}
          className={joinClassNames(classes.header, headerSlotClassName)}
        >
          <VireoFormSectionLabel
            {...labelSlotOther}
            as={slots.label ?? headingTag}
            ownerState={ownerState}
            id={headingId}
            className={joinClassNames(classes.label, labelSlotClassName)}
          >
            {label}
          </VireoFormSectionLabel>
          {ownerState.hasDescription && (
            <VireoFormSectionDescription
              {...descriptionSlotOther}
              as={slots.description}
              component="p"
              ownerState={ownerState}
              id={descriptionId}
              className={joinClassNames(classes.description, descriptionSlotClassName)}
            >
              {description}
            </VireoFormSectionDescription>
          )}
        </VireoFormSectionHeader>
        <VireoFormSectionContent
          {...contentSlotOther}
          as={slots.content}
          ownerState={ownerState}
          className={joinClassNames(classes.content, contentSlotClassName)}
        >
          <VireoFormSectionLayout
            {...layoutSlotOther}
            as={slots.layout}
            ownerState={ownerState}
            className={joinClassNames(classes.layout, layoutSlotClassName)}
          >
            {children}
          </VireoFormSectionLayout>
        </VireoFormSectionContent>
      </VireoFormSectionRoot>
    );
  },
);
VireoFormSection.displayName = VIREO_FORM_SECTION_NAME;
