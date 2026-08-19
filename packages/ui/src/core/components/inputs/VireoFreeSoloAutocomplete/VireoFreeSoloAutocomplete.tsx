import { VireoAutocomplete } from "@/core/components/inputs/VireoAutocomplete";
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
  getVireoFreeSoloAutocompleteUtilityClass,
  type VireoFreeSoloAutocompleteClassKey,
} from "./VireoFreeSoloAutocomplete.classes";
import {
  VIREO_FREE_SOLO_AUTOCOMPLETE_NAME,
  type VireoFreeSoloAutocompleteSlotName,
} from "./VireoFreeSoloAutocomplete.identity";
import { VireoFreeSoloAutocompleteRoot } from "./VireoFreeSoloAutocomplete.styled";
import type { VireoFreeSoloAutocompleteProps } from "./VireoFreeSoloAutocomplete.types";
function useUtilityClasses(classes?: Partial<Record<VireoFreeSoloAutocompleteClassKey, string>>) {
  return composeClasses(
    { root: ["root"] } as const satisfies UtilityClassSlotMap<
      VireoFreeSoloAutocompleteSlotName,
      VireoFreeSoloAutocompleteClassKey
    >,
    getVireoFreeSoloAutocompleteUtilityClass,
    classes,
  );
}
function Impl<TOption>(
  inProps: VireoFreeSoloAutocompleteProps<TOption>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const props = useThemeProps({ props: inProps, name: VIREO_FREE_SOLO_AUTOCOMPLETE_NAME });
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
  } = props as VireoFreeSoloAutocompleteProps<TOption> & {
    className?: string;
    style?: React.CSSProperties;
    sx?: VireoFreeSoloAutocompleteProps<TOption>["sx"];
  };
  const [searchText, setSearchText] = React.useState(value ?? "");
  React.useEffect(() => setSearchText(value ?? ""), [value]);
  const resolvedValue = React.useMemo(
    () =>
      value === null
        ? null
        : (options.find(option => getStringValue(option) === value) ?? createSyntheticOption(value)),
    [createSyntheticOption, getStringValue, options, value],
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
                <MenuItem
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => {
                    onChange(searchText);
                    setSearchText("");
                  }}
                >
                  {addIcon && <ListItemIcon>{addIcon}</ListItemIcon>}
                  <ListItemText primary={addLabel(searchText)} />
                </MenuItem>
              </>
            )}
          </Paper>
        );
      }),
    [addIcon, addLabel, onChange, searchText],
  );
  const ownerState = { disabled, error, hasValue: value !== null };
  const classes = useUtilityClasses(classesProp);
  const root = resolveSlotProps(slotProps.root, ownerState);
  const { className: rootClass, ref: rootSlotRef, style: rootStyle, sx: rootSx, ...rootOther } = root;
  const rootRef = useForkRef(forwardedRef, rootSlotRef);
  return (
    <VireoFreeSoloAutocompleteRoot
      {...other}
      {...rootOther}
      as={slots.root}
      ref={rootRef}
      ownerState={ownerState}
      className={joinClassNames(classes.root, className, rootClass)}
      style={{ ...style, ...rootStyle }}
      sx={mergeSx(sx, rootSx)}
    >
      <VireoAutocomplete
        value={resolvedValue}
        onChange={option => onChange(option ? getStringValue(option) : null)}
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
    </VireoFreeSoloAutocompleteRoot>
  );
}
export const VireoFreeSoloAutocomplete = React.forwardRef(Impl) as <TOption>(
  props: VireoFreeSoloAutocompleteProps<TOption> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement;
