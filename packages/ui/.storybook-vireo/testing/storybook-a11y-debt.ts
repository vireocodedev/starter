export const VIREO_STORYBOOK_A11Y_DEBT_LIMIT = 45;

export type VireoStorybookA11yDebtGroup = {
  owner: string;
  expiresOn: `${number}-${number}-${number}`;
  stories: readonly string[];
};

/**
 * Browser-discovered axe debt grouped by its architectural owner.
 *
 * Remove a story as soon as its findings are fixed. The contract gate permits
 * this list to shrink, rejects growth beyond the original baseline, and fails
 * expired groups so exemptions cannot become permanent policy.
 */
export const vireoStorybookA11yDebtGroups = [
  {
    owner: "capabilities/application-navigation",
    expiresOn: "2026-12-31",
    stories: [
      "TypeScript/UI/Capabilities/Application Navigation/VireoApplicationNavigation::Default",
      "TypeScript/UI/Capabilities/Application Navigation/VireoApplicationNavigation::Locked Mode",
      "TypeScript/UI/Capabilities/Application Navigation/VireoApplicationNavigation::Customized Slots",
      "TypeScript/UI/Capabilities/Application Navigation/VireoApplicationNavigation::Theme Customization",
    ],
  },
  {
    owner: "capabilities/application-preferences",
    expiresOn: "2026-12-31",
    stories: [
      "TypeScript/UI/Capabilities/Application Preferences/VireoPreferencePanel::Default",
      "TypeScript/UI/Capabilities/Application Preferences/VireoPreferencePanel::Search And Automatic Expansion",
      "TypeScript/UI/Capabilities/Application Preferences/VireoPreferencePanel::Controlled Expansion",
      "TypeScript/UI/Capabilities/Application Preferences/VireoPreferencePanel::Compact Container Layout",
      "TypeScript/UI/Capabilities/Application Preferences/VireoPreferencePanel::Section Actions",
      "TypeScript/UI/Capabilities/Application Preferences/VireoPreferencePanel::Theme Customization",
    ],
  },
  {
    owner: "capabilities/country",
    expiresOn: "2026-12-31",
    stories: ["TypeScript/UI/Capabilities/Countries/VireoCountryFlag::Flag Registry"],
  },
  {
    owner: "capabilities/forms",
    expiresOn: "2026-12-31",
    stories: [
      "TypeScript/UI/Capabilities/Forms/Fields/VireoFormAutocompleteField::Loading",
      "TypeScript/UI/Capabilities/Forms/Fields/VireoFormAutocompleteMultipleField::Loading",
      "TypeScript/UI/Capabilities/Forms/Fields/VireoFormFileField::Disabled And Read Only",
      "TypeScript/UI/Capabilities/Forms/Fields/VireoFormFileListField::Disabled And Read Only",
      "TypeScript/UI/Capabilities/Forms/Fields/VireoFormFreeSoloAutocompleteField::Loading",
      "TypeScript/UI/Capabilities/Forms/Fields/VireoFormFreeSoloAutocompleteMultipleField::Loading",
      "TypeScript/UI/Capabilities/Forms/Fields/VireoFormToggleButtonGroupField::Disabled And Read Only",
      "TypeScript/UI/Capabilities/Forms/Fields/VireoFormToggleButtonGroupField::Zod Field Validation",
      "TypeScript/UI/Capabilities/Forms/Fields/VireoFormToggleButtonGroupField::Zod Form Validation",
      "TypeScript/UI/Capabilities/Forms/Multi-Step/VireoFormMultiStep::Default",
      "TypeScript/UI/Capabilities/Forms/Multi-Step/VireoFormNextStepButton::Loading",
      "TypeScript/UI/Capabilities/Forms/VireoFormSection::Container Responsive Columns",
    ],
  },
  {
    owner: "capabilities/history",
    expiresOn: "2026-12-31",
    stories: [
      "TypeScript/UI/Capabilities/History/VireoHistoryEntry::Default",
      "TypeScript/UI/Capabilities/History/VireoHistoryEntry::Loaded",
      "TypeScript/UI/Capabilities/History/VireoHistoryEntry::Added And Removed",
      "TypeScript/UI/Capabilities/History/VireoHistoryEntry::Nested Expansion",
      "TypeScript/UI/Capabilities/History/VireoHistoryEntry::Long Values",
      "TypeScript/UI/Capabilities/History/VireoHistoryEntry::Mobile Layout",
    ],
  },
  {
    owner: "capabilities/overlays",
    expiresOn: "2026-12-31",
    stories: [
      "TypeScript/UI/Capabilities/Overlays/VireoBottomDrawer::Default",
      "TypeScript/UI/Capabilities/Overlays/VireoConfirmationDialog::Provider Hook",
      "TypeScript/UI/Capabilities/Overlays/VireoDockedSidePanel::Default",
      "TypeScript/UI/Capabilities/Overlays/VireoOverlayHeader::Sticky Behavior",
      "TypeScript/UI/Capabilities/Overlays/VireoResponsiveOverlayFrame::Default",
      "TypeScript/UI/Capabilities/Overlays/VireoResponsiveOverlayFrame::Docked Side Panel",
      "TypeScript/UI/Capabilities/Overlays/VireoResponsiveOverlayFrame::Resizable Docked Side Panel",
    ],
  },
  {
    owner: "core",
    expiresOn: "2026-12-31",
    stories: [
      "TypeScript/UI/Core/Behavior/VireoDelayedRender::Default",
      "TypeScript/UI/Core/Controls/VireoActionPreviewButton::Default",
      "TypeScript/UI/Core/Feedback/VireoLoadingRegion::Loading",
      "TypeScript/UI/Core/Feedback/VireoSkeleton::Default",
      "TypeScript/UI/Core/Feedback/VireoSkeleton::Geometry Preserving Text",
      "TypeScript/UI/Core/Feedback/VireoStatusDot::Selected Surface",
    ],
  },
  {
    owner: "integrations/hello-pangea-dnd",
    expiresOn: "2026-12-31",
    stories: ["TypeScript/UI/Integrations/Drag and Drop · Hello Pangea DND/VireoDraggableItem::Default"],
  },
  {
    owner: "integrations/event-source",
    expiresOn: "2026-12-31",
    stories: ["TypeScript/UI/Integrations/Event Source/useVireoEventSource::Default"],
  },
  {
    owner: "integrations/sonner",
    expiresOn: "2026-12-31",
    stories: ["TypeScript/UI/Integrations/Notifications · Sonner/VireoToaster::Scoped Toaster"],
  },
] as const satisfies readonly VireoStorybookA11yDebtGroup[];

export const vireoStorybookA11yDebt: ReadonlyMap<string, { expiresOn: string; owner: string }> = new Map(
  vireoStorybookA11yDebtGroups.flatMap(({ expiresOn, owner, stories }) =>
    stories.map(story => [story, { expiresOn, owner }] as const),
  ),
);

export function hasVireoStorybookA11yDebt(title: string, name: string) {
  return vireoStorybookA11yDebt.has(`${title}::${name}`);
}
