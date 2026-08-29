/**
 * Exact baseline of axe findings that pre-date the executable Storybook gate.
 * Removing a key promotes that story to the default fail-on-violation policy;
 * adding a key requires an intentional contract change and review.
 */
export const vireoStorybookA11yDebt = new Set([
  "TypeScript/UI/Capabilities/Application Navigation/VireoApplicationNavigation::Default",
  "TypeScript/UI/Capabilities/Application Navigation/VireoApplicationNavigation::Locked Mode",
  "TypeScript/UI/Capabilities/Application Navigation/VireoApplicationNavigation::Customized Slots",
  "TypeScript/UI/Capabilities/Application Navigation/VireoApplicationNavigation::Theme Customization",
  "TypeScript/UI/Capabilities/Application Preferences/VireoPreferencePanel::Default",
  "TypeScript/UI/Capabilities/Application Preferences/VireoPreferencePanel::Search And Automatic Expansion",
  "TypeScript/UI/Capabilities/Application Preferences/VireoPreferencePanel::Controlled Expansion",
  "TypeScript/UI/Capabilities/Application Preferences/VireoPreferencePanel::Compact Container Layout",
  "TypeScript/UI/Capabilities/Application Preferences/VireoPreferencePanel::Section Actions",
  "TypeScript/UI/Capabilities/Application Preferences/VireoPreferencePanel::Theme Customization",
  "TypeScript/UI/Capabilities/Countries/VireoCountryFlag::Flag Registry",
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
  "TypeScript/UI/Capabilities/History/VireoHistoryEntry::Default",
  "TypeScript/UI/Capabilities/History/VireoHistoryEntry::Loaded",
  "TypeScript/UI/Capabilities/History/VireoHistoryEntry::Added And Removed",
  "TypeScript/UI/Capabilities/History/VireoHistoryEntry::Nested Expansion",
  "TypeScript/UI/Capabilities/History/VireoHistoryEntry::Long Values",
  "TypeScript/UI/Capabilities/History/VireoHistoryEntry::Mobile Layout",
  "TypeScript/UI/Capabilities/Overlays/VireoBottomDrawer::Default",
  "TypeScript/UI/Capabilities/Overlays/VireoConfirmationDialog::Provider Hook",
  "TypeScript/UI/Capabilities/Overlays/VireoDockedSidePanel::Default",
  "TypeScript/UI/Capabilities/Overlays/VireoOverlayHeader::Sticky Behavior",
  "TypeScript/UI/Capabilities/Overlays/VireoResponsiveOverlayFrame::Default",
  "TypeScript/UI/Capabilities/Overlays/VireoResponsiveOverlayFrame::Docked Side Panel",
  "TypeScript/UI/Capabilities/Overlays/VireoResponsiveOverlayFrame::Resizable Docked Side Panel",
  "TypeScript/UI/Core/Behavior/VireoDelayedRender::Default",
  "TypeScript/UI/Core/Controls/VireoActionPreviewButton::Default",
  "TypeScript/UI/Core/Feedback/VireoLoadingRegion::Loading",
  "TypeScript/UI/Core/Feedback/VireoSkeleton::Default",
  "TypeScript/UI/Core/Feedback/VireoSkeleton::Geometry Preserving Text",
  "TypeScript/UI/Core/Feedback/VireoStatusDot::Selected Surface",
  "TypeScript/UI/Integrations/Drag and Drop · Hello Pangea DND/VireoDraggableItem::Default",
  "TypeScript/UI/Integrations/Event Source/useVireoEventSource::Default",
  "TypeScript/UI/Integrations/Notifications · Sonner/VireoToaster::Scoped Toaster",
]);

export function hasVireoStorybookA11yDebt(title: string, name: string) {
  return vireoStorybookA11yDebt.has(`${title}::${name}`);
}
