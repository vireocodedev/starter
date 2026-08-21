import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import { unstable_composeClasses as composeClasses } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { useVireoMultiStepContext } from "@/capabilities/forms/contexts/VireoMultiStepContext/VireoMultiStepContext";
import type { VireoMultiStepStepState } from "@/capabilities/forms/types/vireoMultiStep.types";
import {
  type VireoFormStepProgressClassKey,
  getVireoFormStepProgressUtilityClass,
} from "./VireoFormStepProgress.classes";
import { VIREO_FORM_STEP_PROGRESS_NAME, type VireoFormStepProgressSlotName } from "./VireoFormStepProgress.identity";
import {
  VireoFormStepProgressCompactCount,
  VireoFormStepProgressCompactLabel,
  VireoFormStepProgressCompactProgress,
  VireoFormStepProgressCompactRoot,
  VireoFormStepProgressCompactTrigger,
  VireoFormStepProgressConnector,
  VireoFormStepProgressList,
  VireoFormStepProgressMenu,
  VireoFormStepProgressMenuItem,
  VireoFormStepProgressRoot,
  VireoFormStepProgressStatusIcon,
  VireoFormStepProgressStep,
  VireoFormStepProgressStepButton,
  VireoFormStepProgressStepLabel,
} from "./VireoFormStepProgress.styled";
import { type VireoFormStepProgressOwnerState, type VireoFormStepProgressProps } from "./VireoFormStepProgress.types";

function useUtilityClasses(
  _ownerState: VireoFormStepProgressOwnerState,
  classes?: VireoFormStepProgressProps["classes"],
) {
  return composeClasses(
    {
      root: ["root"],
      list: ["list"],
      step: ["step"],
      stepButton: ["stepButton"],
      statusIcon: ["statusIcon"],
      stepLabel: ["stepLabel"],
      connector: ["connector"],
      compactRoot: ["compactRoot"],
      compactTrigger: ["compactTrigger"],
      compactLabel: ["compactLabel"],
      compactCount: ["compactCount"],
      compactProgress: ["compactProgress"],
      menu: ["menu"],
      menuItem: ["menuItem"],
    } as const satisfies UtilityClassSlotMap<VireoFormStepProgressSlotName, VireoFormStepProgressClassKey>,
    getVireoFormStepProgressUtilityClass,
    classes,
  );
}

function stepLabel(step: VireoMultiStepStepState<string>, index: number): string {
  if (step.ariaLabel) return step.ariaLabel;
  return typeof step.label === "string" ? step.label : `Step ${index + 1}`;
}

function statusLabel(
  step: VireoMultiStepStepState<string>,
  localeText: ReturnType<typeof useVireoMultiStepContext>["localeText"],
): string {
  if (step.hasError) return localeText.errorStatus;
  if (step.isCurrent) return localeText.currentStatus;
  if (step.isComplete) return localeText.completeStatus;
  if (step.isVisited) return localeText.visitedStatus;
  return localeText.upcomingStatus;
}

function statusContent(step: VireoMultiStepStepState<string>, index: number): React.ReactNode {
  if (step.hasError) return "!";
  if (step.isComplete) return "✓";
  return index + 1;
}

/** Shows accessible, container-responsive progress and optional direct navigation for a bound multi-step form. */
export const VireoFormStepProgress = React.forwardRef<HTMLDivElement, VireoFormStepProgressProps>(
  function VireoFormStepProgress(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_FORM_STEP_PROGRESS_NAME });
    const {
      className,
      classes: classesProp,
      compactBreakpoint = 600,
      layout = "responsive",
      navigation = "visited",
      slotProps = {},
      slots = {},
      style,
      sx,
      ...other
    } = props;
    const { controller, localeText } = useVireoMultiStepContext();
    const state = React.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
    const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);

    const ownerState: VireoFormStepProgressOwnerState = { compactBreakpoint, layout, navigation };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const resolvedListSlotProps = resolveSlotProps(slotProps.list, ownerState);
    const resolvedCompactRootSlotProps = resolveSlotProps(slotProps.compactRoot, ownerState);
    const resolvedCompactTriggerSlotProps = resolveSlotProps(slotProps.compactTrigger, ownerState);
    const resolvedCompactLabelSlotProps = resolveSlotProps(slotProps.compactLabel, ownerState);
    const resolvedCompactCountSlotProps = resolveSlotProps(slotProps.compactCount, ownerState);
    const resolvedCompactProgressSlotProps = resolveSlotProps(slotProps.compactProgress, ownerState);
    const resolvedMenuSlotProps = resolveSlotProps(slotProps.menu, ownerState);
    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const { className: listSlotClassName, ...listSlotOther } = resolvedListSlotProps;
    const { className: compactRootSlotClassName, ...compactRootSlotOther } = resolvedCompactRootSlotProps;
    const {
      className: compactTriggerSlotClassName,
      onClick: compactTriggerSlotOnClick,
      ...compactTriggerSlotOther
    } = resolvedCompactTriggerSlotProps;
    const { className: compactLabelSlotClassName, ...compactLabelSlotOther } = resolvedCompactLabelSlotProps;
    const { className: compactCountSlotClassName, ...compactCountSlotOther } = resolvedCompactCountSlotProps;
    const { className: compactProgressSlotClassName, ...compactProgressSlotOther } = resolvedCompactProgressSlotProps;
    const { className: menuSlotClassName, onClose: menuSlotOnClose, ...menuSlotOther } = resolvedMenuSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);
    const current = state.currentStep;
    const navigableSteps = state.activeSteps.filter(step => {
      if (step.isCurrent || navigation === "none") return false;
      if (navigation === "all") return true;
      return step.canNavigate;
    });
    const currentLabel = stepLabel(current, state.currentStepIndex);
    const stepCount = localeText.stepCount({ current: state.currentStepIndex + 1, total: state.activeStepCount });
    const progress = state.activeStepCount === 0 ? 0 : ((state.currentStepIndex + 1) / state.activeStepCount) * 100;

    const renderStep = (step: VireoMultiStepStepState<string>, index: number) => {
      const stepOwnerState = { ...ownerState, step };
      const resolvedStepSlotProps = resolveSlotProps(slotProps.step, stepOwnerState);
      const resolvedStepButtonSlotProps = resolveSlotProps(slotProps.stepButton, stepOwnerState);
      const resolvedStatusIconSlotProps = resolveSlotProps(slotProps.statusIcon, stepOwnerState);
      const resolvedStepLabelSlotProps = resolveSlotProps(slotProps.stepLabel, stepOwnerState);
      const resolvedConnectorSlotProps = resolveSlotProps(slotProps.connector, stepOwnerState);
      const { className: stepSlotClassName, ...stepSlotOther } = resolvedStepSlotProps;
      const {
        className: stepButtonSlotClassName,
        onClick: stepButtonSlotOnClick,
        ...stepButtonSlotOther
      } = resolvedStepButtonSlotProps;
      const { className: statusIconSlotClassName, ...statusIconSlotOther } = resolvedStatusIconSlotProps;
      const { className: stepLabelSlotClassName, ...stepLabelSlotOther } = resolvedStepLabelSlotProps;
      const { className: connectorSlotClassName, ...connectorSlotOther } = resolvedConnectorSlotProps;
      const label = stepLabel(step, index);
      const canNavigate = !step.isCurrent && navigation !== "none" && (navigation === "all" || step.canNavigate);
      return (
        <VireoFormStepProgressStep
          {...stepSlotOther}
          as={slots.step ?? "li"}
          key={step.id}
          ownerState={stepOwnerState}
          className={joinClassNames(classes.step, stepSlotClassName)}
        >
          <VireoFormStepProgressStepButton
            {...stepButtonSlotOther}
            as={slots.stepButton}
            ownerState={stepOwnerState}
            aria-current={step.isCurrent ? "step" : undefined}
            aria-label={`${label}, ${statusLabel(step, localeText)}`}
            disabled={!canNavigate}
            onClick={event => {
              stepButtonSlotOnClick?.(event);
              if (!event.defaultPrevented && canNavigate) void controller.goToStep(step.id);
            }}
            className={joinClassNames(classes.stepButton, stepButtonSlotClassName)}
          >
            <VireoFormStepProgressStatusIcon
              {...statusIconSlotOther}
              as={slots.statusIcon ?? "span"}
              ownerState={stepOwnerState}
              aria-hidden="true"
              className={joinClassNames(classes.statusIcon, statusIconSlotClassName)}
            >
              {statusContent(step, index)}
            </VireoFormStepProgressStatusIcon>
            <VireoFormStepProgressStepLabel
              {...stepLabelSlotOther}
              as={slots.stepLabel ?? "span"}
              ownerState={stepOwnerState}
              className={joinClassNames(classes.stepLabel, stepLabelSlotClassName)}
            >
              {step.label}
            </VireoFormStepProgressStepLabel>
          </VireoFormStepProgressStepButton>
          {index < state.activeSteps.length - 1 && (
            <VireoFormStepProgressConnector
              {...connectorSlotOther}
              as={slots.connector ?? "span"}
              ownerState={stepOwnerState}
              aria-hidden="true"
              className={joinClassNames(classes.connector, connectorSlotClassName)}
            />
          )}
        </VireoFormStepProgressStep>
      );
    };

    return (
      <VireoFormStepProgressRoot
        {...other}
        {...rootSlotOther}
        as={slots.root ?? "nav"}
        ref={rootRef}
        ownerState={ownerState}
        aria-label={other["aria-label"] ?? localeText.progressLabel}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        <VireoFormStepProgressList
          {...listSlotOther}
          as={slots.list ?? "ol"}
          ownerState={ownerState}
          className={joinClassNames(classes.list, listSlotClassName)}
          style={{ "--vireo-step-count": state.activeStepCount } as React.CSSProperties}
        >
          {state.activeSteps.map(renderStep)}
        </VireoFormStepProgressList>
        <VireoFormStepProgressCompactRoot
          {...compactRootSlotOther}
          as={slots.compactRoot}
          ownerState={ownerState}
          className={joinClassNames(classes.compactRoot, compactRootSlotClassName)}
        >
          {navigableSteps.length > 0 ? (
            <VireoFormStepProgressCompactTrigger
              {...compactTriggerSlotOther}
              as={slots.compactTrigger}
              ownerState={ownerState}
              aria-label={localeText.openStepMenu({
                label: currentLabel,
                current: state.currentStepIndex + 1,
                total: state.activeStepCount,
              })}
              onClick={event => {
                compactTriggerSlotOnClick?.(event);
                if (!event.defaultPrevented) setMenuAnchor(event.currentTarget);
              }}
              className={joinClassNames(classes.compactTrigger, compactTriggerSlotClassName)}
            >
              <VireoFormStepProgressCompactLabel
                {...compactLabelSlotOther}
                as={slots.compactLabel ?? "span"}
                ownerState={ownerState}
                className={joinClassNames(classes.compactLabel, compactLabelSlotClassName)}
              >
                {current.label}
              </VireoFormStepProgressCompactLabel>
              <VireoFormStepProgressCompactCount
                {...compactCountSlotOther}
                as={slots.compactCount ?? "span"}
                ownerState={ownerState}
                className={joinClassNames(classes.compactCount, compactCountSlotClassName)}
              >
                {stepCount}
              </VireoFormStepProgressCompactCount>
            </VireoFormStepProgressCompactTrigger>
          ) : (
            <div>
              <VireoFormStepProgressCompactLabel
                {...compactLabelSlotOther}
                as={slots.compactLabel ?? "span"}
                ownerState={ownerState}
                className={joinClassNames(classes.compactLabel, compactLabelSlotClassName)}
              >
                {current.label}
              </VireoFormStepProgressCompactLabel>{" "}
              <VireoFormStepProgressCompactCount
                {...compactCountSlotOther}
                as={slots.compactCount ?? "span"}
                ownerState={ownerState}
                className={joinClassNames(classes.compactCount, compactCountSlotClassName)}
              >
                {stepCount}
              </VireoFormStepProgressCompactCount>
            </div>
          )}
          <VireoFormStepProgressCompactProgress
            {...compactProgressSlotOther}
            as={slots.compactProgress}
            ownerState={ownerState}
            aria-label={stepCount}
            variant="determinate"
            value={progress}
            className={joinClassNames(classes.compactProgress, compactProgressSlotClassName)}
          />
        </VireoFormStepProgressCompactRoot>
        <VireoFormStepProgressMenu
          {...menuSlotOther}
          as={slots.menu}
          ownerState={ownerState}
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={(event, reason) => {
            menuSlotOnClose?.(event, reason);
            setMenuAnchor(null);
          }}
          className={joinClassNames(classes.menu, menuSlotClassName)}
        >
          {navigableSteps.map(step => {
            const index = state.activeSteps.findIndex(candidate => candidate.id === step.id);
            const stepOwnerState = { ...ownerState, step };
            const resolvedMenuItemSlotProps = resolveSlotProps(slotProps.menuItem, stepOwnerState);
            const {
              className: menuItemSlotClassName,
              onClick: menuItemSlotOnClick,
              ...menuItemSlotOther
            } = resolvedMenuItemSlotProps;
            return (
              <VireoFormStepProgressMenuItem
                {...menuItemSlotOther}
                as={slots.menuItem}
                key={step.id}
                ownerState={stepOwnerState}
                onClick={event => {
                  menuItemSlotOnClick?.(event);
                  if (!event.defaultPrevented) {
                    setMenuAnchor(null);
                    void controller.goToStep(step.id);
                  }
                }}
                className={joinClassNames(classes.menuItem, menuItemSlotClassName)}
              >
                <VireoFormStepProgressStatusIcon ownerState={stepOwnerState} aria-hidden="true">
                  {statusContent(step, index)}
                </VireoFormStepProgressStatusIcon>
                {step.label}
              </VireoFormStepProgressMenuItem>
            );
          })}
        </VireoFormStepProgressMenu>
      </VireoFormStepProgressRoot>
    );
  },
);

VireoFormStepProgress.displayName = VIREO_FORM_STEP_PROGRESS_NAME;
