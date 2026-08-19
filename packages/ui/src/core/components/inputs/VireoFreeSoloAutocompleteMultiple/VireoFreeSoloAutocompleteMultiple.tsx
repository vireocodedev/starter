import { VireoAutocompleteMultiple } from "@/core/components/inputs/VireoAutocompleteMultiple";
import { type UtilityClassSlotMap, joinClassNames, mergeSx, resolveSlotProps } from "@/core/utils/muiutils";
import {
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  unstable_composeClasses as composeClasses,
  type PaperProps,
} from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import { useForkRef } from "@mui/material/utils";
import React from "react";
import {
  getVireoFreeSoloAutocompleteMultipleUtilityClass,
  type VireoFreeSoloAutocompleteMultipleClassKey,
} from "./VireoFreeSoloAutocompleteMultiple.classes";
import {
  VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME,
  type VireoFreeSoloAutocompleteMultipleSlotName,
} from "./VireoFreeSoloAutocompleteMultiple.identity";
import { VireoFreeSoloAutocompleteMultipleRoot } from "./VireoFreeSoloAutocompleteMultiple.styled";
import type { VireoFreeSoloAutocompleteMultipleProps } from "./VireoFreeSoloAutocompleteMultiple.types";
function useUtilityClasses(classes?: Partial<Record<VireoFreeSoloAutocompleteMultipleClassKey, string>>) {
  return composeClasses(
    { root: ["root"] } as const satisfies UtilityClassSlotMap<
      VireoFreeSoloAutocompleteMultipleSlotName,
      VireoFreeSoloAutocompleteMultipleClassKey
    >,
    getVireoFreeSoloAutocompleteMultipleUtilityClass,
    classes,
  );
}
function Impl<TOption>(
  inProps: VireoFreeSoloAutocompleteMultipleProps<TOption>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const props = useThemeProps({ props: inProps, name: VIREO_FREE_SOLO_AUTOCOMPLETE_MULTIPLE_NAME });
  const {
    addIcon,
    addLabel,
    autocompleteProps = {},
    className,
    classes: classesProp,
    createSyntheticOption,
    disabled = false,
    error = false,
    getOptionLabel,
    getStringValue,
    helperText,
    inputRef,
    isOptionEqualToValue,
    name,
    onBlur,
    onChange,
    options,
    slotProps = {},
    slots = {},
    style,
    sx,
    textFieldProps,
    value,
    ...other
  } = props as VireoFreeSoloAutocompleteMultipleProps<TOption> & {
    className?: string;
    style?: React.CSSProperties;
    sx?: VireoFreeSoloAutocompleteMultipleProps<TOption>["sx"];
  };
  const [searchText, setSearchText] = React.useState("");
  const resolvedValue = React.useMemo(
    () =>
      (value ?? []).map(item => options.find(option => getStringValue(option) === item) ?? createSyntheticOption(item)),
    [createSyntheticOption, getStringValue, options, value],
  );
  const handleAdd = React.useCallback(
    (text: string) => {
      const current = value ?? [];
      if (!current.includes(text)) onChange([...current, text]);
      setSearchText("");
    },
    [onChange, value],
  );
  const AddPaper = React.useMemo(
    () =>
      React.forwardRef<HTMLDivElement, PaperProps>(function AddPaper({ children, ...paperProps }, ref) {
        return (
          <Paper {...paperProps} ref={ref}>
            {children}
            {searchText.trim() !== "" && (
              <>
                <Divider />
                <MenuItem onMouseDown={event => event.preventDefault()} onClick={() => handleAdd(searchText)}>
                  {addIcon && <ListItemIcon>{addIcon}</ListItemIcon>}
                  <ListItemText primary={addLabel(searchText)} />
                </MenuItem>
              </>
            )}
          </Paper>
        );
      }),
    [addIcon, addLabel, handleAdd, searchText],
  );
  const ownerState = { disabled, error, hasValue: (value?.length ?? 0) > 0 };
  const classes = useUtilityClasses(classesProp);
  const root = resolveSlotProps(slotProps.root, ownerState);
  const { className: rootClass, ref: rootSlotRef, style: rootStyle, sx: rootSx, ...rootOther } = root;
  const rootRef = useForkRef(forwardedRef, rootSlotRef);
  return (
    <VireoFreeSoloAutocompleteMultipleRoot
      {...other}
      {...rootOther}
      as={slots.root}
      ref={rootRef}
      ownerState={ownerState}
      className={joinClassNames(classes.root, className, rootClass)}
      style={{ ...style, ...rootStyle }}
      sx={mergeSx(sx, rootSx)}
    >
      <VireoAutocompleteMultiple
        value={resolvedValue}
        onChange={selected => {
          const strings = selected.map(getStringValue).filter((item): item is string => item !== null);
          onChange(strings.length === 0 ? null : strings);
        }}
        options={options}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={isOptionEqualToValue}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        disabled={disabled}
        error={error}
        helperText={helperText}
        name={name}
        onBlur={onBlur}
        inputRef={inputRef}
        autocompleteProps={{ ...autocompleteProps, slots: { ...autocompleteProps.slots, paper: AddPaper } }}
        textFieldProps={textFieldProps}
      />
    </VireoFreeSoloAutocompleteMultipleRoot>
  );
}
export const VireoFreeSoloAutocompleteMultiple = React.forwardRef(Impl) as <TOption>(
  props: VireoFreeSoloAutocompleteMultipleProps<TOption> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement;
