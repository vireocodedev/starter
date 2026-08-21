import { useVireoFormContext } from "@/capabilities/forms/contexts/VireoFormContext/VireoFormContext";
import { useVireoTanStackFormContext } from "@/capabilities/forms/contexts/VireoFormHookContexts/VireoFormHookContexts";
import { useOptionalVireoMultiStepContext } from "@/capabilities/forms/contexts/VireoMultiStepContext/VireoMultiStepContext";
import { defaultVireoFormErrorFormatter } from "@/capabilities/forms/utils/vireoFormErrors";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import { useStore } from "@tanstack/react-form";
import React from "react";
import {
  getVireoFormErrorSummaryUtilityClass,
  type VireoFormErrorSummaryClassKey,
} from "./VireoFormErrorSummary.classes";
import { VIREO_FORM_ERROR_SUMMARY_NAME, type VireoFormErrorSummarySlotName } from "./VireoFormErrorSummary.identity";
import {
  VireoFormErrorSummaryContent,
  VireoFormErrorSummaryGroup,
  VireoFormErrorSummaryGroupLabel,
  VireoFormErrorSummaryIcon,
  VireoFormErrorSummaryItem,
  VireoFormErrorSummaryItemButton,
  VireoFormErrorSummaryList,
  VireoFormErrorSummaryRoot,
  VireoFormErrorSummaryTitle,
} from "./VireoFormErrorSummary.styled";
import {
  defaultVireoFormErrorSummaryLocaleText,
  type VireoFormErrorSummaryOwnerState,
  type VireoFormErrorSummaryProps,
} from "./VireoFormErrorSummary.types";

type SummaryError = { message: string; path?: string; stepId?: string };
type SummaryGroup = { id: string; label: React.ReactNode; errors: SummaryError[] };

function useUtilityClasses(
  _ownerState: VireoFormErrorSummaryOwnerState,
  classes?: VireoFormErrorSummaryProps["classes"],
) {
  return composeClasses(
    {
      root: ["root"],
      icon: ["icon"],
      content: ["content"],
      title: ["title"],
      group: ["group"],
      groupLabel: ["groupLabel"],
      list: ["list"],
      item: ["item"],
      itemButton: ["itemButton"],
    } as const satisfies UtilityClassSlotMap<VireoFormErrorSummarySlotName, VireoFormErrorSummaryClassKey>,
    getVireoFormErrorSummaryUtilityClass,
    classes,
  );
}

function focusField(root: HTMLElement | null, path: string): void {
  const escaped = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(path) : path.replace(/["\\]/g, "\\$&");
  const target = root
    ?.closest("form")
    ?.querySelector<HTMLElement>(`[name="${escaped}"], [data-vireo-field-name="${escaped}"]`);
  target?.focus();
  target?.scrollIntoView?.({ block: "nearest" });
}

/** Summarizes form and field validation errors and links mapped errors back to their controls and steps. */
export const VireoFormErrorSummary = React.forwardRef<HTMLDivElement, VireoFormErrorSummaryProps>(
  function VireoFormErrorSummary(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_ERROR_SUMMARY_NAME });
    const {
      className,
      classes: classesProp,
      localeText,
      scope = "form",
      slotProps = {},
      slots = {},
      style,
      sx,
      title,
      ...other
    } = props;
    const form = useVireoTanStackFormContext();
    const formPolicy = useVireoFormContext();
    const multiStep = useOptionalVireoMultiStepContext();
    const formState = useStore(form.store, state => ({
      errors: state.errors,
      fieldMeta: state.fieldMeta,
    }));
    const multiState = React.useSyncExternalStore(
      multiStep?.controller.subscribe ?? (() => () => undefined),
      multiStep?.controller.getSnapshot ?? (() => undefined),
      multiStep?.controller.getSnapshot ?? (() => undefined),
    );
    const formatter = formPolicy.formatError ?? defaultVireoFormErrorFormatter;
    const resolvedLocaleText = { ...defaultVireoFormErrorSummaryLocaleText, ...localeText };

    const errors = React.useMemo(() => {
      const result: SummaryError[] = [];
      const seen = new Set<string>();
      const push = (error: unknown, path?: string) => {
        const message = formatter(error);
        if (!message) return;
        const key = `${path ?? ""}\0${message}`;
        if (seen.has(key)) return;
        seen.add(key);
        const step = path
          ? multiState?.activeSteps.find(candidate =>
              candidate.fields.some(field => path === field || path.startsWith(`${field}.`)),
            )
          : undefined;
        result.push({ message, path, stepId: step?.id });
      };
      for (const error of formState.errors) push(error);
      if (scope === "all") {
        for (const [path, meta] of Object.entries(formState.fieldMeta)) {
          if (!meta || typeof meta !== "object" || !("errors" in meta) || !Array.isArray(meta.errors)) continue;
          for (const error of meta.errors) push(error, path);
        }
      }
      return result;
    }, [formState.errors, formState.fieldMeta, formatter, multiState, scope]);

    const groups = React.useMemo(() => {
      const result: SummaryGroup[] = [];
      const rootErrors = errors.filter(error => !error.path);
      if (rootErrors.length) result.push({ id: "form", label: resolvedLocaleText.formGroupLabel, errors: rootErrors });
      for (const step of multiState?.activeSteps ?? []) {
        const stepErrors = errors.filter(error => error.stepId === step.id);
        if (stepErrors.length) result.push({ id: step.id, label: step.label, errors: stepErrors });
      }
      const other = errors.filter(error => error.path && !error.stepId);
      if (other.length) result.push({ id: "other", label: resolvedLocaleText.otherGroupLabel, errors: other });
      return result;
    }, [errors, multiState, resolvedLocaleText.formGroupLabel, resolvedLocaleText.otherGroupLabel]);

    const ownerState: VireoFormErrorSummaryOwnerState = { errorCount: errors.length, scope };
    const classes = useUtilityClasses(ownerState, classesProp);
    const rootElementRef = React.useRef<HTMLDivElement | null>(null);
    React.useEffect(() => multiStep?.controller.registerErrorSummary(rootElementRef.current), [multiStep]);
    const resolvedRoot = resolveSlotProps(slotProps.root, ownerState);
    const resolvedIcon = resolveSlotProps(slotProps.icon, ownerState);
    const resolvedContent = resolveSlotProps(slotProps.content, ownerState);
    const resolvedTitle = resolveSlotProps(slotProps.title, ownerState);
    const resolvedGroup = resolveSlotProps(slotProps.group, ownerState);
    const resolvedGroupLabel = resolveSlotProps(slotProps.groupLabel, ownerState);
    const resolvedList = resolveSlotProps(slotProps.list, ownerState);
    const resolvedItem = resolveSlotProps(slotProps.item, ownerState);
    const resolvedItemButton = resolveSlotProps(slotProps.itemButton, ownerState);
    const { className: rootClassName, ref: rootSlotRef, style: rootStyle, sx: rootSx, ...rootOther } = resolvedRoot;
    const { className: iconClassName, ...iconOther } = resolvedIcon;
    const { className: contentClassName, ...contentOther } = resolvedContent;
    const { className: titleClassName, ...titleOther } = resolvedTitle;
    const { className: groupClassName, ...groupOther } = resolvedGroup;
    const { className: groupLabelClassName, ...groupLabelOther } = resolvedGroupLabel;
    const { className: listClassName, ...listOther } = resolvedList;
    const { className: itemClassName, ...itemOther } = resolvedItem;
    const { className: itemButtonClassName, onClick: itemButtonOnClick, ...itemButtonOther } = resolvedItemButton;
    const rootRef = useForkRef(forwardedRef, rootSlotRef, rootElementRef);
    if (errors.length === 0) return null;

    return (
      <VireoFormErrorSummaryRoot
        {...other}
        {...rootOther}
        as={slots.root}
        ref={rootRef}
        ownerState={ownerState}
        role="alert"
        severity="error"
        tabIndex={-1}
        data-vireo-error-summary="true"
        icon={
          <VireoFormErrorSummaryIcon
            {...iconOther}
            as={slots.icon ?? "span"}
            ownerState={ownerState}
            aria-hidden="true"
            className={joinClassNames(classes.icon, iconClassName)}
          >
            !
          </VireoFormErrorSummaryIcon>
        }
        className={joinClassNames(classes.root, className, rootClassName)}
        style={{ ...style, ...rootStyle }}
        sx={mergeSx(sx, rootSx)}
      >
        <VireoFormErrorSummaryContent
          {...contentOther}
          as={slots.content}
          ownerState={ownerState}
          className={joinClassNames(classes.content, contentClassName)}
        >
          <VireoFormErrorSummaryTitle
            {...titleOther}
            as={slots.title}
            component="h2"
            ownerState={ownerState}
            className={joinClassNames(classes.title, titleClassName)}
          >
            {title ?? resolvedLocaleText.title({ count: errors.length })}
          </VireoFormErrorSummaryTitle>
          {groups.map(group => (
            <VireoFormErrorSummaryGroup
              {...groupOther}
              as={slots.group}
              key={group.id}
              ownerState={ownerState}
              className={joinClassNames(classes.group, groupClassName)}
            >
              <VireoFormErrorSummaryGroupLabel
                {...groupLabelOther}
                as={slots.groupLabel}
                component="h3"
                ownerState={ownerState}
                className={joinClassNames(classes.groupLabel, groupLabelClassName)}
              >
                {group.label}
              </VireoFormErrorSummaryGroupLabel>
              <VireoFormErrorSummaryList
                {...listOther}
                as={slots.list ?? "ul"}
                ownerState={ownerState}
                className={joinClassNames(classes.list, listClassName)}
              >
                {group.errors.map((error, index) => (
                  <VireoFormErrorSummaryItem
                    {...itemOther}
                    as={slots.item ?? "li"}
                    key={`${error.path ?? "form"}-${index}`}
                    ownerState={ownerState}
                    className={joinClassNames(classes.item, itemClassName)}
                  >
                    {error.path ? (
                      <VireoFormErrorSummaryItemButton
                        {...itemButtonOther}
                        as={slots.itemButton}
                        ownerState={ownerState}
                        aria-label={resolvedLocaleText.navigateToError({ message: error.message })}
                        onClick={event => {
                          itemButtonOnClick?.(event);
                          if (event.defaultPrevented) return;
                          const navigate =
                            error.stepId && multiStep ? multiStep.controller.goToStep(error.stepId) : Promise.resolve();
                          void navigate.finally(() =>
                            window.requestAnimationFrame(() => focusField(rootElementRef.current, error.path!)),
                          );
                        }}
                        className={joinClassNames(classes.itemButton, itemButtonClassName)}
                      >
                        {error.message}
                      </VireoFormErrorSummaryItemButton>
                    ) : (
                      error.message
                    )}
                  </VireoFormErrorSummaryItem>
                ))}
              </VireoFormErrorSummaryList>
            </VireoFormErrorSummaryGroup>
          ))}
        </VireoFormErrorSummaryContent>
      </VireoFormErrorSummaryRoot>
    );
  },
);
VireoFormErrorSummary.displayName = VIREO_FORM_ERROR_SUMMARY_NAME;
