import type {
  VireoMultiStepChangeEvent,
  VireoMultiStepChangeReason,
  VireoMultiStepDescriptor,
  VireoMultiStepNavigationResult,
  VireoMultiStepState,
  VireoMultiStepStepState,
} from "@/capabilities/forms/types/vireoMultiStep.types";
import type { AnyFormApi } from "@tanstack/react-form";

type Listener = () => void;

function normalizePath(path: string): string {
  return path.replace(/\[(\d+)\]/g, ".$1").replace(/^\./, "");
}

function ownsPath(owner: string, candidate: string): boolean {
  const normalizedOwner = normalizePath(owner);
  const normalizedCandidate = normalizePath(candidate);
  return normalizedCandidate === normalizedOwner || normalizedCandidate.startsWith(`${normalizedOwner}.`);
}

function hasErrors(meta: unknown): boolean {
  if (!meta || typeof meta !== "object" || !("errors" in meta)) return false;
  return Array.isArray(meta.errors) && meta.errors.length > 0;
}

export type VireoMultiStepRuntimeDescriptor = VireoMultiStepDescriptor<unknown, string>;

export class VireoMultiStepStore {
  readonly form: AnyFormApi;
  private descriptors: VireoMultiStepRuntimeDescriptor[];
  private listeners = new Set<Listener>();
  private visited = new Set<string>();
  private completed = new Set<string>();
  private errored = new Set<string>();
  private registeredSteps = new Map<string, HTMLElement>();
  private currentStepId: string;
  private initialStepId: string;
  private transitioning = false;
  private transitionVersion = 0;
  private valueRevision = 0;
  private lastValues: unknown;
  private pendingFocusStepId?: string;
  private snapshot!: VireoMultiStepState<string>;
  private unsubscribeForm?: { unsubscribe: () => void };
  private onStepChange?: (event: VireoMultiStepChangeEvent<string>) => void;

  constructor(
    form: AnyFormApi,
    descriptors: readonly VireoMultiStepRuntimeDescriptor[],
    initialStepId?: string,
    onStepChange?: (event: VireoMultiStepChangeEvent<string>) => void,
  ) {
    this.form = form;
    this.lastValues = form.state.values;
    this.descriptors = descriptors.map(step => ({ ...step, fields: this.normalizeFields(step) }));
    this.assertStructure();
    const active = this.getActiveDescriptors();
    if (active.length === 0) throw new Error("A Vireo multi-step form requires at least one active step.");
    const requestedInitial = active.find(step => step.id === initialStepId);
    if (initialStepId && !requestedInitial && process.env.NODE_ENV !== "production") {
      console.warn(
        `Vireo multi-step form initialStepId \"${initialStepId}\" is unavailable; using the first active step.`,
      );
    }
    this.currentStepId = requestedInitial?.id ?? active[0].id;
    this.initialStepId = this.currentStepId;
    this.visited.add(this.currentStepId);
    this.onStepChange = onStepChange;
    this.rebuildSnapshot();
    this.unsubscribeForm = form.store.subscribe(() => this.handleFormChange());
  }

  dispose(): void {
    this.transitionVersion += 1;
    this.pendingFocusStepId = undefined;
    this.unsubscribeForm?.unsubscribe();
    this.unsubscribeForm = undefined;
    this.listeners.clear();
  }

  update(
    descriptors: readonly VireoMultiStepRuntimeDescriptor[],
    onStepChange?: (event: VireoMultiStepChangeEvent<string>) => void,
  ): void {
    const nextStructure = descriptors.map(step => ({ id: step.id, fields: this.normalizeFields(step) }));
    const currentStructure = this.descriptors.map(step => ({ id: step.id, fields: step.fields ?? [] }));
    if (JSON.stringify(nextStructure) !== JSON.stringify(currentStructure)) {
      if (process.env.NODE_ENV !== "production") {
        console.error(
          "Vireo multi-step form step ids, order, and field ownership must remain stable. Remount the form to change its structure.",
        );
      }
      return;
    }
    this.descriptors = this.descriptors.map((step, index) => ({
      ...step,
      label: descriptors[index].label,
      ariaLabel: descriptors[index].ariaLabel,
      when: descriptors[index].when,
    }));
    this.onStepChange = onStepChange;
    this.reconcileActiveStep("condition");
    this.rebuildSnapshot();
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): VireoMultiStepState<string> => this.snapshot;

  getStepState = (id: string): VireoMultiStepStepState<string> | undefined =>
    this.snapshot.steps.find(step => step.id === id);

  registerStep(id: string, element: HTMLElement | null): () => void {
    if (element) {
      if (
        this.registeredSteps.has(id) &&
        this.registeredSteps.get(id) !== element &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn(`Vireo multi-step form rendered more than one form.Step for \"${id}\".`);
      }
      this.registeredSteps.set(id, element);
      if (this.pendingFocusStepId === id) {
        window.requestAnimationFrame(() => this.focusStep(id, false));
      }
    }
    return () => {
      if (this.registeredSteps.get(id) === element) this.registeredSteps.delete(id);
    };
  }

  focusStep(id: string, retry = true): void {
    const step = this.registeredSteps.get(id);
    if (!step) {
      if (retry) {
        window.requestAnimationFrame(() => {
          if (this.pendingFocusStepId === id) this.focusStep(id, false);
        });
      } else if (this.pendingFocusStepId === id && process.env.NODE_ENV !== "production") {
        console.warn(`Vireo multi-step form step \"${id}\" has no rendered form.Step content.`);
      }
      return;
    }
    step.focus();
    step.scrollIntoView?.({ block: "nearest" });
    if (this.pendingFocusStepId === id) this.pendingFocusStepId = undefined;
  }

  async goToNextStep(): Promise<VireoMultiStepNavigationResult<string>> {
    const active = this.getActiveDescriptors();
    const index = active.findIndex(step => step.id === this.currentStepId);
    if (index >= active.length - 1) return this.unchanged(this.currentStepId, "last-step");
    return this.navigateForward(active[index + 1].id, "next");
  }

  async goToPreviousStep(): Promise<VireoMultiStepNavigationResult<string>> {
    if (this.transitioning) return this.unchanged(this.currentStepId, "transition-pending");
    const active = this.getActiveDescriptors();
    const index = active.findIndex(step => step.id === this.currentStepId);
    if (index <= 0) return this.unchanged(this.currentStepId, "first-step");
    const requested = active[index - 1].id;
    return this.changeStep(requested, requested, "previous", "previous");
  }

  async goToStep(requestedStepId: string): Promise<VireoMultiStepNavigationResult<string>> {
    if (this.transitioning) return this.unchanged(requestedStepId, "transition-pending");
    if (requestedStepId === this.currentStepId) return this.unchanged(requestedStepId, "same-step");
    const active = this.getActiveDescriptors();
    const currentIndex = active.findIndex(step => step.id === this.currentStepId);
    const requestedIndex = active.findIndex(step => step.id === requestedStepId);
    if (requestedIndex < 0) return this.unchanged(requestedStepId, "unavailable-step");
    if (requestedIndex < currentIndex) return this.changeStep(requestedStepId, requestedStepId, "direct", "direct");
    return this.navigateForward(requestedStepId, "direct");
  }

  reset(): void {
    const previous = this.currentStepId;
    this.transitionVersion += 1;
    this.transitioning = false;
    this.visited.clear();
    this.completed.clear();
    this.errored.clear();
    const active = this.getActiveDescriptors();
    this.currentStepId = active.some(step => step.id === this.initialStepId) ? this.initialStepId : active[0].id;
    this.visited.add(this.currentStepId);
    this.rebuildSnapshot();
    this.emit();
    if (previous !== this.currentStepId) this.emitStepChange(previous, this.currentStepId, "reset");
  }

  async handleInvalidSubmit(): Promise<void> {
    const firstErrorPath = this.collectErrorPaths()[0];
    if (!firstErrorPath) return;
    const owner = this.getActiveDescriptors().find(step =>
      (step.fields ?? []).some(field => ownsPath(field, firstErrorPath)),
    );
    if (!owner) return;
    const previous = this.currentStepId;
    if (owner.id !== previous) {
      this.setCurrent(owner.id);
      this.emitStepChange(previous, owner.id, "validation-error");
    }
    window.requestAnimationFrame(() => {
      const root = this.registeredSteps.get(owner.id);
      const target = root?.querySelector<HTMLElement>(
        '[aria-invalid="true"] [data-vireo-field-focus-target="true"], [aria-invalid="true"]:not([disabled]), [aria-invalid="true"] input:not([disabled])',
      );
      (target ?? root)?.focus();
    });
  }

  private async navigateForward(
    requestedStepId: string,
    reason: "next" | "direct",
  ): Promise<VireoMultiStepNavigationResult<string>> {
    if (this.transitioning) return this.unchanged(requestedStepId, "transition-pending");
    this.transitioning = true;
    const transition = ++this.transitionVersion;
    this.rebuildSnapshot();
    this.emit();
    try {
      const validation = await this.validateStep(this.currentStepId, transition);
      if (validation.cancelled)
        return { status: "cancelled", stepId: this.currentStepId, requestedStepId, reason: validation.reason };
      if (validation.errorPaths.length > 0) {
        this.errored.add(this.currentStepId);
        this.completed.delete(this.currentStepId);
        this.rebuildSnapshot();
        this.emit();
        return { status: "invalid", stepId: this.currentStepId, requestedStepId, errorPaths: validation.errorPaths };
      }
      this.errored.delete(this.currentStepId);
      this.completed.add(this.currentStepId);
      const active = this.getActiveDescriptors();
      const currentIndex = active.findIndex(step => step.id === this.currentStepId);
      const requestedIndex = active.findIndex(step => step.id === requestedStepId);
      const incomplete = active.slice(currentIndex + 1, requestedIndex).find(step => !this.completed.has(step.id));
      const destination = incomplete?.id ?? requestedStepId;
      return this.changeStep(destination, requestedStepId, incomplete ? "incomplete-step" : reason, reason);
    } finally {
      if (transition === this.transitionVersion) {
        this.transitioning = false;
        this.rebuildSnapshot();
        this.emit();
      }
    }
  }

  private async validateStep(
    stepId: string,
    transition: number,
  ): Promise<
    | { cancelled: true; reason: "reset" | "step-changed" | "form-unmounted" }
    | { cancelled: false; errorPaths: string[] }
  > {
    const step = this.descriptors.find(item => item.id === stepId);
    if (!step) return { cancelled: false, errorPaths: [] };
    while (true) {
      const revision = this.valueRevision;
      await Promise.all((step.fields ?? []).map(field => this.form.validateField(field as never, "submit")));
      if (transition !== this.transitionVersion) return { cancelled: true, reason: "step-changed" };
      if (revision !== this.valueRevision) continue;
      return { cancelled: false, errorPaths: this.collectErrorPaths(step.fields ?? []) };
    }
  }

  private collectErrorPaths(ownedFields?: readonly string[]): string[] {
    return Object.entries(this.form.state.fieldMeta)
      .filter(([, meta]) => hasErrors(meta))
      .map(([path]) => normalizePath(path))
      .filter(path => !ownedFields || ownedFields.some(owner => ownsPath(owner, path)));
  }

  private changeStep(
    stepId: string,
    requestedStepId: string,
    resultReason: "next" | "previous" | "direct" | "incomplete-step",
    eventReason: VireoMultiStepChangeReason,
  ): VireoMultiStepNavigationResult<string> {
    const previous = this.currentStepId;
    this.pendingFocusStepId = stepId;
    this.setCurrent(stepId);
    this.emitStepChange(previous, stepId, eventReason);
    window.requestAnimationFrame(() => this.focusStep(stepId));
    return {
      status: "changed",
      previousStepId: previous,
      stepId,
      requestedStepId,
      reachedRequestedStep: stepId === requestedStepId,
      reason: resultReason,
    };
  }

  private setCurrent(stepId: string): void {
    this.currentStepId = stepId;
    this.visited.add(stepId);
    this.rebuildSnapshot();
    this.emit();
  }

  private unchanged(
    requestedStepId: string,
    reason: "first-step" | "last-step" | "same-step" | "unavailable-step" | "transition-pending",
  ): VireoMultiStepNavigationResult<string> {
    return { status: "unchanged", stepId: this.currentStepId, requestedStepId, reason };
  }

  private handleFormChange(): void {
    if (this.form.state.values !== this.lastValues) {
      this.lastValues = this.form.state.values;
      this.valueRevision += 1;
    }
    for (const step of this.descriptors) {
      if (
        this.completed.has(step.id) &&
        (step.fields ?? []).some(field => this.form.getFieldMeta(field as never)?.isDirty)
      ) {
        this.completed.delete(step.id);
        this.visited.add(step.id);
      }
    }
    this.reconcileActiveStep("condition");
    this.refreshErrors();
    this.rebuildSnapshot();
    this.emit();
  }

  private refreshErrors(): void {
    for (const step of this.descriptors) {
      if ((step.fields ?? []).some(field => this.collectErrorPaths([field]).length > 0)) this.errored.add(step.id);
      else this.errored.delete(step.id);
    }
  }

  private reconcileActiveStep(reason: "condition"): void {
    const active = this.getActiveDescriptors();
    if (active.length === 0) {
      if (process.env.NODE_ENV !== "production")
        console.error("A Vireo multi-step form must always have at least one active step.");
      return;
    }
    if (active.some(step => step.id === this.currentStepId)) return;
    const declaredIndex = this.descriptors.findIndex(step => step.id === this.currentStepId);
    const previous = [...active]
      .reverse()
      .find(step => this.descriptors.findIndex(item => item.id === step.id) < declaredIndex);
    const destination =
      previous ??
      active.find(step => this.descriptors.findIndex(item => item.id === step.id) > declaredIndex) ??
      active[0];
    const old = this.currentStepId;
    this.currentStepId = destination.id;
    this.visited.add(destination.id);
    this.emitStepChange(old, destination.id, reason);
  }

  private getActiveDescriptors(): VireoMultiStepRuntimeDescriptor[] {
    const values = this.form.state.values;
    return this.descriptors.filter(step => !step.when || step.when(values));
  }

  private rebuildSnapshot(): void {
    const activeDescriptors = this.getActiveDescriptors();
    const activeIds = new Set(activeDescriptors.map(step => step.id));
    const steps = this.descriptors.map((step, declaredIndex): VireoMultiStepStepState<string> => {
      const activeIndex = activeDescriptors.findIndex(item => item.id === step.id);
      const isVisited = this.visited.has(step.id);
      const isComplete = this.completed.has(step.id);
      const hasError = this.errored.has(step.id);
      return {
        id: step.id,
        label: step.label,
        ariaLabel: step.ariaLabel,
        fields: (step.fields ?? []) as readonly string[],
        declaredIndex,
        activeIndex: activeIndex < 0 ? null : activeIndex,
        isActive: activeIds.has(step.id),
        isCurrent: step.id === this.currentStepId,
        isVisited,
        isComplete,
        hasError,
        canNavigate: activeIndex >= 0 && (isVisited || step.id === this.currentStepId),
        status: !activeIds.has(step.id)
          ? null
          : hasError
            ? "error"
            : isComplete
              ? "complete"
              : isVisited
                ? "visited"
                : "upcoming",
      };
    });
    const activeSteps = steps.filter(step => step.isActive);
    const currentStepIndex = activeSteps.findIndex(step => step.id === this.currentStepId);
    const currentStep = activeSteps[currentStepIndex] ?? activeSteps[0];
    this.snapshot = {
      steps,
      activeSteps,
      currentStep,
      currentStepId: currentStep.id,
      currentStepIndex,
      activeStepCount: activeSteps.length,
      completedStepCount: activeSteps.filter(step => step.isComplete).length,
      isFirstStep: currentStepIndex <= 0,
      isLastStep: currentStepIndex >= activeSteps.length - 1,
      isStepTransitioning: this.transitioning,
      canGoPrevious: currentStepIndex > 0 && !this.transitioning,
      canGoNext: currentStepIndex < activeSteps.length - 1 && !this.transitioning,
      canSubmitCurrentStep: currentStepIndex === activeSteps.length - 1 && !this.transitioning,
    };
  }

  private emit(): void {
    this.listeners.forEach(listener => listener());
  }

  private emitStepChange(previousStepId: string, stepId: string, reason: VireoMultiStepChangeReason): void {
    const active = this.getActiveDescriptors();
    const previousStepIndex = active.findIndex(step => step.id === previousStepId);
    const stepIndex = active.findIndex(step => step.id === stepId);
    this.onStepChange?.({
      previousStepId,
      stepId,
      previousStepIndex,
      stepIndex,
      direction: stepIndex >= previousStepIndex ? "forward" : "backward",
      reason,
    });
  }

  private normalizeFields(step: VireoMultiStepRuntimeDescriptor): readonly string[] {
    const normalized = [...new Set((step.fields ?? []).map(field => normalizePath(String(field))))];
    return normalized.filter(field => !normalized.some(other => other !== field && ownsPath(other, field)));
  }

  private assertStructure(): void {
    const ids = new Set<string>();
    const owners: { stepId: string; field: string }[] = [];
    for (const step of this.descriptors) {
      if (ids.has(step.id)) throw new Error(`Vireo multi-step form step id \"${step.id}\" is duplicated.`);
      ids.add(step.id);
      for (const field of step.fields ?? []) {
        const conflict = owners.find(
          owner => owner.stepId !== step.id && (ownsPath(owner.field, field) || ownsPath(field, owner.field)),
        );
        if (conflict)
          throw new Error(
            `Vireo multi-step field ownership overlaps between \"${conflict.stepId}\" and \"${step.id}\" at \"${field}\".`,
          );
        owners.push({ stepId: step.id, field });
      }
    }
  }
}
