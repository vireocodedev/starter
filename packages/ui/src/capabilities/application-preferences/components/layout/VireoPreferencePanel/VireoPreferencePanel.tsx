import { useVireoPageLayout } from "@/capabilities/page-layout/public";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/public";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import { unstable_composeClasses as composeClasses, type AccordionProps } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoPreferencePanelClassKey, getVireoPreferencePanelUtilityClass } from "./VireoPreferencePanel.classes";
import { VIREO_PREFERENCE_PANEL_NAME, type VireoPreferencePanelSlotName } from "./VireoPreferencePanel.identity";
import {
  VireoPreferencePanelEmptyState,
  VireoPreferencePanelItem,
  VireoPreferencePanelItemContent,
  VireoPreferencePanelItemControl,
  VireoPreferencePanelItemDescription,
  VireoPreferencePanelItemIcon,
  VireoPreferencePanelItemTitle,
  VireoPreferencePanelRoot,
  VireoPreferencePanelSection,
  VireoPreferencePanelSectionAction,
  VireoPreferencePanelSectionDetails,
  VireoPreferencePanelSectionHeader,
  VireoPreferencePanelSectionSummary,
} from "./VireoPreferencePanel.styled";
import {
  type VireoPreferencePanelOwnerState,
  type VireoPreferencePanelProps,
  type VireoPreferenceSectionDefinition,
} from "./VireoPreferencePanel.types";

function useUtilityClasses(
  _ownerState: VireoPreferencePanelOwnerState,
  classes?: VireoPreferencePanelProps["classes"],
) {
  return composeClasses(
    {
      root: ["root"],
      section: ["section"],
      sectionHeader: ["sectionHeader"],
      sectionSummary: ["sectionSummary"],
      sectionAction: ["sectionAction"],
      sectionDetails: ["sectionDetails"],
      item: ["item"],
      itemIcon: ["itemIcon"],
      itemContent: ["itemContent"],
      itemTitle: ["itemTitle"],
      itemDescription: ["itemDescription"],
      itemControl: ["itemControl"],
      emptyState: ["emptyState"],
    } as const satisfies UtilityClassSlotMap<VireoPreferencePanelSlotName, VireoPreferencePanelClassKey>,
    getVireoPreferencePanelUtilityClass,
    classes,
  );
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .trim();
}

function orderKnownSectionIds(
  ids: readonly string[],
  sections: readonly VireoPreferenceSectionDefinition[],
): readonly string[] {
  const requestedIds = new Set(ids);
  return sections.filter(section => requestedIds.has(section.id)).map(section => section.id);
}

function getVisibleSections(
  sections: readonly VireoPreferenceSectionDefinition[],
  normalizedSearchQuery: string,
): readonly VireoPreferenceSectionDefinition[] {
  if (!normalizedSearchQuery) return sections;

  return sections.flatMap(section => {
    const items = section.items.filter(item =>
      normalizeSearchValue(
        [item.title, item.description, ...(item.searchKeywords ?? [])].filter(Boolean).join(" "),
      ).includes(normalizedSearchQuery),
    );
    return items.length > 0 ? [{ ...section, items }] : [];
  });
}

function warnAboutDuplicateIds(sections: readonly VireoPreferenceSectionDefinition[]): void {
  if (process.env.NODE_ENV === "production") return;

  const sectionIds = new Set<string>();
  const itemIds = new Set<string>();
  for (const section of sections) {
    if (sectionIds.has(section.id)) {
      console.warn(`${VIREO_PREFERENCE_PANEL_NAME}: duplicate section id "${section.id}".`);
    }
    sectionIds.add(section.id);

    for (const item of section.items) {
      if (itemIds.has(item.id)) {
        console.warn(`${VIREO_PREFERENCE_PANEL_NAME}: duplicate item id "${item.id}".`);
      }
      itemIds.add(item.id);
    }
  }
}

/** Renders searchable, container-responsive groups of application preference controls. */
export const VireoPreferencePanel = React.forwardRef<HTMLDivElement, VireoPreferencePanelProps>(
  function VireoPreferencePanel(inProps, forwardedRef) {
    const props = useThemeProps({ props: inProps, name: VIREO_PREFERENCE_PANEL_NAME });
    const {
      className,
      classes: classesProp,
      controlWidth = 352,
      defaultExpandedSectionIds = [],
      emptyState,
      expandedSectionIds,
      onExpandedSectionIdsChange,
      searchQuery = "",
      sections,
      slotProps = {},
      slots = {},
      stickySectionHeaders = true,
      style,
      sx,
      ...other
    } = props;

    const layout = useVireoPageLayout();
    const generatedId = React.useId();
    const [uncontrolledExpandedSectionIds, setUncontrolledExpandedSectionIds] = React.useState<readonly string[]>(() =>
      orderKnownSectionIds(defaultExpandedSectionIds, sections),
    );
    const normalizedSearchQuery = normalizeSearchValue(searchQuery);
    const visibleSections = React.useMemo(
      () => getVisibleSections(sections, normalizedSearchQuery),
      [normalizedSearchQuery, sections],
    );
    const manualExpandedSectionIds = orderKnownSectionIds(
      expandedSectionIds ?? uncontrolledExpandedSectionIds,
      sections,
    );
    const renderedExpandedSectionIds = normalizedSearchQuery
      ? visibleSections.map(section => section.id)
      : manualExpandedSectionIds;

    React.useEffect(() => {
      warnAboutDuplicateIds(sections);
    }, [sections]);

    React.useEffect(() => {
      if (expandedSectionIds === undefined) {
        setUncontrolledExpandedSectionIds(currentIds => {
          const nextIds = orderKnownSectionIds(currentIds, sections);
          return nextIds.length === currentIds.length && nextIds.every((id, index) => id === currentIds[index])
            ? currentIds
            : nextIds;
        });
      }
    }, [expandedSectionIds, sections]);

    const ownerState: VireoPreferencePanelOwnerState = {
      controlWidth,
      hasVisibleItems: visibleSections.length > 0,
      isCompact: layout.isCompact,
      isFiltering: normalizedSearchQuery.length > 0,
      stickySectionHeaders,
    };
    const classes = useUtilityClasses(ownerState, classesProp);

    const resolvedRootSlotProps = resolveSlotProps(slotProps.root, ownerState);
    const resolvedSectionSlotProps = resolveSlotProps(slotProps.section, ownerState);
    const resolvedSectionHeaderSlotProps = resolveSlotProps(slotProps.sectionHeader, ownerState);
    const resolvedSectionSummarySlotProps = resolveSlotProps(slotProps.sectionSummary, ownerState);
    const resolvedSectionActionSlotProps = resolveSlotProps(slotProps.sectionAction, ownerState);
    const resolvedSectionDetailsSlotProps = resolveSlotProps(slotProps.sectionDetails, ownerState);
    const resolvedItemSlotProps = resolveSlotProps(slotProps.item, ownerState);
    const resolvedItemIconSlotProps = resolveSlotProps(slotProps.itemIcon, ownerState);
    const resolvedItemContentSlotProps = resolveSlotProps(slotProps.itemContent, ownerState);
    const resolvedItemTitleSlotProps = resolveSlotProps(slotProps.itemTitle, ownerState);
    const resolvedItemDescriptionSlotProps = resolveSlotProps(slotProps.itemDescription, ownerState);
    const resolvedItemControlSlotProps = resolveSlotProps(slotProps.itemControl, ownerState);
    const resolvedEmptyStateSlotProps = resolveSlotProps(slotProps.emptyState, ownerState);

    const {
      className: rootSlotClassName,
      ref: rootSlotRef,
      style: rootSlotStyle,
      sx: rootSlotSx,
      ...rootSlotOther
    } = resolvedRootSlotProps;
    const {
      className: sectionSlotClassName,
      onChange: sectionSlotOnChange,
      slotProps: sectionSlotProps,
      ...sectionSlotOther
    } = resolvedSectionSlotProps;
    const { className: sectionHeaderSlotClassName, ...sectionHeaderSlotOther } = resolvedSectionHeaderSlotProps;
    const { className: sectionSummarySlotClassName, ...sectionSummarySlotOther } = resolvedSectionSummarySlotProps;
    const { className: sectionActionSlotClassName, ...sectionActionSlotOther } = resolvedSectionActionSlotProps;
    const { className: sectionDetailsSlotClassName, ...sectionDetailsSlotOther } = resolvedSectionDetailsSlotProps;
    const { className: itemSlotClassName, ...itemSlotOther } = resolvedItemSlotProps;
    const { className: itemIconSlotClassName, ...itemIconSlotOther } = resolvedItemIconSlotProps;
    const { className: itemContentSlotClassName, ...itemContentSlotOther } = resolvedItemContentSlotProps;
    const {
      className: itemTitleSlotClassName,
      component: itemTitleSlotComponent,
      ...itemTitleSlotOther
    } = resolvedItemTitleSlotProps;
    const { className: itemDescriptionSlotClassName, ...itemDescriptionSlotOther } = resolvedItemDescriptionSlotProps;
    const { className: itemControlSlotClassName, ...itemControlSlotOther } = resolvedItemControlSlotProps;
    const { className: emptyStateSlotClassName, ...emptyStateSlotOther } = resolvedEmptyStateSlotProps;
    const rootRef = useForkRef(forwardedRef, rootSlotRef);

    const updateExpandedSection = React.useCallback(
      (sectionId: string, expanded: boolean) => {
        const nextIds = orderKnownSectionIds(
          expanded
            ? [...manualExpandedSectionIds, sectionId]
            : manualExpandedSectionIds.filter(candidateId => candidateId !== sectionId),
          sections,
        );
        if (expandedSectionIds === undefined) setUncontrolledExpandedSectionIds(nextIds);
        onExpandedSectionIdsChange?.(nextIds);
      },
      [expandedSectionIds, manualExpandedSectionIds, onExpandedSectionIdsChange, sections],
    );

    const createSectionChangeHandler = React.useCallback(
      (sectionId: string): NonNullable<AccordionProps["onChange"]> =>
        (event, expanded) => {
          sectionSlotOnChange?.(event, expanded);
          if (!event.defaultPrevented && !normalizedSearchQuery) updateExpandedSection(sectionId, expanded);
        },
      [normalizedSearchQuery, sectionSlotOnChange, updateExpandedSection],
    );

    return (
      <VireoPreferencePanelRoot
        variant="outlined"
        {...other}
        {...rootSlotOther}
        as={slots.root}
        ref={rootRef}
        ownerState={ownerState}
        className={joinClassNames(classes.root, className, rootSlotClassName)}
        style={{ ...style, ...rootSlotStyle }}
        sx={mergeSx(sx, rootSlotSx)}
      >
        {visibleSections.length === 0 ? (
          <VireoPreferencePanelEmptyState
            {...emptyStateSlotOther}
            as={slots.emptyState}
            ownerState={ownerState}
            className={joinClassNames(classes.emptyState, emptyStateSlotClassName)}
          >
            {emptyState}
          </VireoPreferencePanelEmptyState>
        ) : (
          visibleSections.map((section, sectionIndex) => {
            const sectionSummaryId = `${generatedId}-section-${sectionIndex}-summary`;
            const sectionDetailsId = `${generatedId}-section-${sectionIndex}-details`;
            return (
              <VireoPreferencePanelSection
                disableGutters
                {...sectionSlotOther}
                as={slots.section}
                key={section.id}
                ownerState={ownerState}
                expanded={renderedExpandedSectionIds.includes(section.id)}
                onChange={createSectionChangeHandler(section.id)}
                className={joinClassNames(classes.section, sectionSlotClassName)}
                data-section-id={section.id}
                slotProps={{
                  ...sectionSlotProps,
                  region: {
                    ...sectionSlotProps?.region,
                    "aria-labelledby": sectionSummaryId,
                    id: sectionDetailsId,
                    role: "region",
                  },
                }}
              >
                <VireoPreferencePanelSectionHeader
                  {...sectionHeaderSlotOther}
                  as={slots.sectionHeader}
                  ownerState={ownerState}
                  className={joinClassNames(classes.sectionHeader, sectionHeaderSlotClassName)}
                >
                  <VireoPreferencePanelSectionSummary
                    expandIcon={<ExpandMoreRounded />}
                    {...sectionSummarySlotOther}
                    as={slots.sectionSummary}
                    ownerState={ownerState}
                    id={sectionSummaryId}
                    aria-controls={sectionDetailsId}
                    className={joinClassNames(classes.sectionSummary, sectionSummarySlotClassName)}
                  >
                    {section.title}
                  </VireoPreferencePanelSectionSummary>
                  {section.action !== undefined && section.action !== null && (
                    <VireoPreferencePanelSectionAction
                      {...sectionActionSlotOther}
                      as={slots.sectionAction}
                      ownerState={ownerState}
                      className={joinClassNames(classes.sectionAction, sectionActionSlotClassName)}
                    >
                      {section.action}
                    </VireoPreferencePanelSectionAction>
                  )}
                </VireoPreferencePanelSectionHeader>
                <VireoPreferencePanelSectionDetails
                  {...sectionDetailsSlotOther}
                  as={slots.sectionDetails}
                  ownerState={ownerState}
                  className={joinClassNames(classes.sectionDetails, sectionDetailsSlotClassName)}
                >
                  {section.items.map(item => (
                    <VireoPreferencePanelItem
                      {...itemSlotOther}
                      as={slots.item}
                      key={item.id}
                      ownerState={ownerState}
                      className={joinClassNames(classes.item, itemSlotClassName)}
                      data-item-id={item.id}
                    >
                      <VireoPreferencePanelItemIcon
                        {...itemIconSlotOther}
                        as={slots.itemIcon}
                        ownerState={ownerState}
                        aria-hidden="true"
                        className={joinClassNames(classes.itemIcon, itemIconSlotClassName)}
                      >
                        {item.icon}
                      </VireoPreferencePanelItemIcon>
                      <VireoPreferencePanelItemContent
                        {...itemContentSlotOther}
                        as={slots.itemContent}
                        ownerState={ownerState}
                        className={joinClassNames(classes.itemContent, itemContentSlotClassName)}
                      >
                        <VireoPreferencePanelItemTitle
                          variant="subtitle2"
                          {...itemTitleSlotOther}
                          as={slots.itemTitle ?? itemTitleSlotComponent ?? "div"}
                          ownerState={ownerState}
                          className={joinClassNames(classes.itemTitle, itemTitleSlotClassName)}
                        >
                          {item.title}
                        </VireoPreferencePanelItemTitle>
                        {item.description && (
                          <VireoPreferencePanelItemDescription
                            variant="body2"
                            {...itemDescriptionSlotOther}
                            as={slots.itemDescription}
                            ownerState={ownerState}
                            className={joinClassNames(classes.itemDescription, itemDescriptionSlotClassName)}
                          >
                            {item.description}
                          </VireoPreferencePanelItemDescription>
                        )}
                      </VireoPreferencePanelItemContent>
                      <VireoPreferencePanelItemControl
                        {...itemControlSlotOther}
                        as={slots.itemControl}
                        ownerState={ownerState}
                        className={joinClassNames(classes.itemControl, itemControlSlotClassName)}
                      >
                        {item.control}
                      </VireoPreferencePanelItemControl>
                    </VireoPreferencePanelItem>
                  ))}
                </VireoPreferencePanelSectionDetails>
              </VireoPreferencePanelSection>
            );
          })
        )}
      </VireoPreferencePanelRoot>
    );
  },
);

VireoPreferencePanel.displayName = VIREO_PREFERENCE_PANEL_NAME;
