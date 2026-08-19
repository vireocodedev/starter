import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { getVireoFormSectionUtilityClass, type VireoFormSectionClassKey } from "./VireoFormSection.classes";
import { VIREO_FORM_SECTION_NAME, type VireoFormSectionSlotName } from "./VireoFormSection.identity";
import { VireoFormSectionContent, VireoFormSectionLabel, VireoFormSectionRoot } from "./VireoFormSection.styled";
import type { VireoFormSectionProps } from "./VireoFormSection.types";
function useUtilityClasses(classes?: VireoFormSectionProps["classes"]) {
  return composeClasses(
    { root: ["root"], label: ["label"], content: ["content"] } as const satisfies UtilityClassSlotMap<
      VireoFormSectionSlotName,
      VireoFormSectionClassKey
    >,
    getVireoFormSectionUtilityClass,
    classes,
  );
}
/** Groups related form controls under an optional accessible heading and consistent surface. */
export const VireoFormSection = React.forwardRef<HTMLElement, VireoFormSectionProps>(
  function VireoFormSection(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_SECTION_NAME });
    const { children, className, classes: classesProp, label, slotProps = {}, slots = {}, style, sx, ...other } = props;
    const labelled = label !== undefined && !(typeof label === "string" && label.trim() === "");
    const ownerState = { labelled };
    const classes = useUtilityClasses(classesProp);
    const id = React.useId();
    const root = resolveSlotProps(slotProps.root, ownerState);
    const labelProps = resolveSlotProps(slotProps.label, ownerState);
    const content = resolveSlotProps(slotProps.content, ownerState);
    const { className: rootClassName, ref: rootRef, style: rootStyle, sx: rootSx, ...rootOther } = root;
    const { className: labelClassName, ...labelOther } = labelProps;
    const { className: contentClassName, ...contentOther } = content;
    const ref = useForkRef(forwardedRef, rootRef);
    const Label = slots.label ?? VireoFormSectionLabel;
    const Content = slots.content ?? VireoFormSectionContent;
    return (
      <VireoFormSectionRoot
        {...other}
        {...rootOther}
        as={slots.root ?? "section"}
        ref={ref}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootClassName)}
        style={{ ...style, ...rootStyle }}
        sx={mergeSx(sx, rootSx)}
      >
        {labelled && (
          <Label
            {...labelOther}
            ownerState={ownerState}
            id={id}
            className={joinClassNames(classes.label, labelClassName)}
          >
            {label}
          </Label>
        )}
        <Content
          {...contentOther}
          ownerState={ownerState}
          role="group"
          aria-labelledby={labelled ? id : undefined}
          className={joinClassNames(classes.content, contentClassName)}
        >
          {children}
        </Content>
      </VireoFormSectionRoot>
    );
  },
);
VireoFormSection.displayName = VIREO_FORM_SECTION_NAME;
