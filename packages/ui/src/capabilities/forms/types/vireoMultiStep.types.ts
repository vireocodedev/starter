import type { DeepKeys } from "@tanstack/react-form";
import type React from "react";

/** Metadata describing one stable step in a Vireo multi-step form. */
export type VireoMultiStepDescriptor<TFormData, TStepId extends string = string> = {
  id: TStepId;
  label: React.ReactNode;
  ariaLabel?: string;
  fields?: readonly DeepKeys<TFormData>[];
  when?: (values: TFormData) => boolean;
};

export type VireoMultiStepStatus = "upcoming" | "visited" | "complete" | "error";
export type VireoMultiStepDirection = "forward" | "backward";

/** Public state for one configured multi-step form step. */
export type VireoMultiStepStepState<TStepId extends string = string> = {
  id: TStepId;
  label: React.ReactNode;
  ariaLabel?: string;
  fields: readonly string[];
  declaredIndex: number;
  activeIndex: number | null;
  isActive: boolean;
  isCurrent: boolean;
  isVisited: boolean;
  isComplete: boolean;
  hasError: boolean;
  canNavigate: boolean;
  status: VireoMultiStepStatus | null;
};

/** Reactive public state exposed by a Vireo multi-step form. */
export type VireoMultiStepState<TStepId extends string = string> = {
  steps: readonly VireoMultiStepStepState<TStepId>[];
  activeSteps: readonly VireoMultiStepStepState<TStepId>[];
  currentStep: VireoMultiStepStepState<TStepId>;
  currentStepId: TStepId;
  currentStepIndex: number;
  /** Direction of the most recent current-step change. */
  direction: VireoMultiStepDirection;
  activeStepCount: number;
  completedStepCount: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isStepTransitioning: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  canSubmitCurrentStep: boolean;
};

export type VireoMultiStepChangeReason = "next" | "previous" | "direct" | "validation-error" | "condition" | "reset";

export type VireoMultiStepChangeEvent<TStepId extends string = string> = {
  previousStepId: TStepId;
  stepId: TStepId;
  previousStepIndex: number;
  stepIndex: number;
  direction: VireoMultiStepDirection;
  reason: VireoMultiStepChangeReason;
};

export type VireoMultiStepNavigationResult<TStepId extends string = string> =
  | {
      status: "changed";
      previousStepId: TStepId;
      stepId: TStepId;
      requestedStepId: TStepId;
      reachedRequestedStep: boolean;
      reason: "next" | "previous" | "direct" | "incomplete-step";
    }
  | { status: "invalid"; stepId: TStepId; requestedStepId: TStepId; errorPaths: string[] }
  | {
      status: "unchanged";
      stepId: TStepId;
      requestedStepId: TStepId;
      reason: "first-step" | "last-step" | "same-step" | "unavailable-step" | "transition-pending";
    }
  | {
      status: "cancelled";
      stepId: TStepId;
      requestedStepId: TStepId;
      reason: "reset" | "step-changed" | "form-unmounted";
    };

export type VireoFormMultiStepLocaleText = {
  progressLabel: string;
  previousButton: string;
  nextButton: string;
  stepCount: (context: { current: number; total: number }) => string;
  currentStatus: string;
  completeStatus: string;
  errorStatus: string;
  visitedStatus: string;
  upcomingStatus: string;
  openStepMenu: (context: { label: string; current: number; total: number }) => string;
};

export const defaultVireoFormMultiStepLocaleText: VireoFormMultiStepLocaleText = {
  progressLabel: "Form progress",
  previousButton: "Previous",
  nextButton: "Next",
  stepCount: ({ current, total }) => `Step ${current} of ${total}`,
  currentStatus: "Current step",
  completeStatus: "Complete",
  errorStatus: "Contains errors",
  visitedStatus: "Visited",
  upcomingStatus: "Upcoming",
  openStepMenu: ({ label, current, total }) => `${label}, step ${current} of ${total}. Open step menu`,
};
