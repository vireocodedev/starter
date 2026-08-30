import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import { unstable_composeClasses as composeClasses, type TabsProps } from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useControlled, useForkRef } from "@mui/material/utils";
import React from "react";
import { type VireoTabsClassKey, getVireoTabsUtilityClass } from "./VireoTabs.classes";
import { VIREO_TABS_NAME, type VireoTabsSlotName } from "./VireoTabs.identity";
import { VireoTabsList, VireoTabsPanel, VireoTabsRoot, VireoTabsTab } from "./VireoTabs.styled";
import type { VireoTabsOwnerState, VireoTabsProps } from "./VireoTabs.types";

function useUtilityClasses(classes?: VireoTabsProps["classes"]) {
  return composeClasses(
    { root: ["root"], tabs: ["tabs"], tab: ["tab"], panel: ["panel"] } as const satisfies UtilityClassSlotMap<
      VireoTabsSlotName,
      VireoTabsClassKey
    >,
    getVireoTabsUtilityClass,
    classes,
  );
}

/** Renders accessible controlled or uncontrolled tab navigation with its associated panels. */
export const VireoTabs = React.forwardRef<HTMLDivElement, VireoTabsProps>(function VireoTabs(inProps, forwardedRef) {
  const props = useThemeProps({ props: inProps, name: VIREO_TABS_NAME });
  const {
    className,
    classes: classesProp,
    defaultValue,
    onChange,
    slotProps = {},
    slots = {},
    style,
    sx,
    tabs,
    value: valueProp,
    ...other
  } = props;
  const fallbackValue = tabs.find(item => !item.disabled)?.value ?? "";
  const [value, setValue] = useControlled({
    controlled: valueProp,
    default: defaultValue ?? fallbackValue,
    name: VIREO_TABS_NAME,
    state: "value",
  });
  const ownerState: VireoTabsOwnerState = { value, tabCount: tabs.length };
  const classes = useUtilityClasses(classesProp);
  const root = resolveSlotProps(slotProps.root, ownerState);
  const tabsSlot = resolveSlotProps(slotProps.tabs, ownerState);
  const tab = resolveSlotProps(slotProps.tab, ownerState);
  const panel = resolveSlotProps(slotProps.panel, ownerState);
  const { className: rootClassName, ref: rootRef, style: rootStyle, sx: rootSx, ...rootOther } = root;
  const { className: tabsClassName, onChange: tabsSlotOnChange, ...tabsOther } = tabsSlot;
  const { className: tabClassName, ...tabOther } = tab;
  const { className: panelClassName, ...panelOther } = panel;
  const ref = useForkRef(forwardedRef, rootRef);
  const id = React.useId();
  const handleChange = React.useCallback<NonNullable<TabsProps["onChange"]>>(
    (event, nextValue: string) => {
      tabsSlotOnChange?.(event, nextValue);
      if (event.defaultPrevented) return;
      setValue(nextValue);
      onChange?.(nextValue, event);
    },
    [onChange, setValue, tabsSlotOnChange],
  );

  return (
    <VireoTabsRoot
      {...other}
      {...rootOther}
      as={slots.root ?? "div"}
      ref={ref}
      ownerState={ownerState}
      className={joinClassNames(classes.root, className, rootClassName)}
      style={{ ...style, ...rootStyle }}
      sx={mergeSx(sx, rootSx)}
    >
      <VireoTabsList
        {...tabsOther}
        as={slots.tabs}
        ownerState={ownerState}
        value={value === "" ? false : value}
        onChange={handleChange}
        className={joinClassNames(classes.tabs, tabsClassName)}
      >
        {tabs.map(item => (
          <VireoTabsTab
            {...tabOther}
            as={slots.tab}
            ownerState={ownerState}
            key={item.value}
            id={`${id}-tab-${item.value}`}
            aria-controls={`${id}-panel-${item.value}`}
            className={joinClassNames(classes.tab, tabClassName)}
            label={item.label}
            value={item.value}
            disabled={item.disabled}
          />
        ))}
      </VireoTabsList>
      {tabs.map(item => {
        const selected = item.value === value;
        return (
          <VireoTabsPanel
            {...panelOther}
            as={slots.panel ?? "div"}
            ownerState={ownerState}
            key={item.value}
            id={`${id}-panel-${item.value}`}
            aria-labelledby={`${id}-tab-${item.value}`}
            role="tabpanel"
            hidden={!selected}
            className={joinClassNames(classes.panel, panelClassName)}
          >
            {selected ? item.content : null}
          </VireoTabsPanel>
        );
      })}
    </VireoTabsRoot>
  );
});
VireoTabs.displayName = VIREO_TABS_NAME;
