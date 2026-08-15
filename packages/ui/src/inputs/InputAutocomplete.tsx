import {
  AppBar,
  Autocomplete,
  Box,
  CircularProgress,
  Dialog,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  type AutocompleteInputChangeReason,
  type AutocompleteRenderInputParams,
  type AutocompleteRenderOptionState,
  type TextFieldProps,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchIcon from "@mui/icons-material/Search";
import React from "react";

export type SearchOptionsResolver<TOption> =
  | TOption[]
  | readonly TOption[]
  | ((searchText: string) => Promise<TOption[] | readonly TOption[]> | TOption[] | readonly TOption[]);

export type MobilePageLoader<TOption> = (
  searchText: string,
  page: number,
) => Promise<{ options: TOption[]; hasMore: boolean }>;

const MOBILE_OPTION_BUTTON_SX = {
  minHeight: 56,
  px: 2,
  py: 1.25,
} as const;

export type InputAutocompleteCommonProps<TOption> = {
  options: SearchOptionsResolver<TOption>;
  standaloneOptions?: readonly TOption[];
  getOptionLabel: (option: TOption) => string;
  isOptionEqualToValue: (option: TOption, value: TOption) => boolean;
  getOptionDisabled?: (option: TOption) => boolean;
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement> & { key: React.Key },
    option: TOption,
    state: AutocompleteRenderOptionState,
  ) => React.ReactNode;
  renderMobileOption?: (option: TOption) => React.ReactNode;
  searchMinLength?: number;
  searchText?: string;
  onSearchTextChange?: (searchText: string) => void;
  skipInitialSearchWhenValuePresent?: boolean;
  sortOptions?: boolean | ((left: TOption, right: TOption) => number);
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  mobilePicker?: {
    enabled?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    hideTrigger?: boolean;
    title: string;
    closeLabel: string;
    clearSearchLabel: string;
    searchLabel: string;
    noOptionsLabel: string;
    loadPage?: MobilePageLoader<TOption>;
  };
  disabled?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  name?: string;
  inputRef?: TextFieldProps["inputRef"];
  onBlur?: () => void;
  slotProps?: {
    root?: {
      disableClearable?: boolean;
    };
    textField?: TextFieldProps;
  };
};

export type InputAutocompleteProps<TOption> = InputAutocompleteCommonProps<TOption> & {
  value: TOption | null;
  onChange: (value: TOption | null) => void;
};

export type InputAutocompleteMultipleProps<TOption> = InputAutocompleteCommonProps<TOption> & {
  value: TOption[];
  onChange: (value: TOption[] | null) => void;
};

function mergeOptions<TOption>(
  options: readonly TOption[],
  standaloneOptions: readonly TOption[] | undefined,
  equals: (left: TOption, right: TOption) => boolean,
): readonly TOption[] {
  if (!standaloneOptions || standaloneOptions.length === 0) {
    return options;
  }

  const merged = [...standaloneOptions];

  for (const option of options) {
    if (merged.some(existing => equals(existing, option))) {
      continue;
    }

    merged.push(option);
  }

  return merged;
}

function sortAutocompleteOptions<TOption>(
  options: readonly TOption[],
  sortOptions: boolean | ((left: TOption, right: TOption) => number),
  getOptionLabel: (option: TOption) => string,
): readonly TOption[] {
  if (sortOptions === false) {
    return options;
  }

  const compare =
    typeof sortOptions === "function"
      ? sortOptions
      : (left: TOption, right: TOption) => getOptionLabel(left).localeCompare(getOptionLabel(right));

  return [...options].sort(compare);
}

const NO_OPTIONS: readonly never[] = [];

function useAutocompleteSearch<TOption>(
  options: SearchOptionsResolver<TOption>,
  searchText: string,
  isOpen: boolean,
  hasValue: boolean,
  searchMinLength: number,
  skipInitialSearchWhenValuePresent: boolean,
) {
  const [fetchedOptions, setFetchedOptions] = React.useState<readonly TOption[]>(NO_OPTIONS);
  const [loading, setLoading] = React.useState(false);
  const [allowEmptySearchFetch, setAllowEmptySearchFetch] = React.useState(false);

  const resolver = typeof options === "function" ? options : null;
  const staticOptions = typeof options === "function" ? null : options;

  // Callers routinely pass an inline resolver, so its identity changes on every parent render.
  // Reading it from a ref keeps it out of the search effect's dependencies, which would otherwise
  // re-run the search — and re-issue its request — on every unrelated re-render of the parent.
  const resolverRef = React.useRef(resolver);
  React.useEffect(() => {
    resolverRef.current = resolver;
  });

  React.useEffect(() => {
    const trimmedSearch = searchText.trim();
    if (trimmedSearch.length > 0) {
      setAllowEmptySearchFetch(true);
      return;
    }

    if (!skipInitialSearchWhenValuePresent || !hasValue) {
      setAllowEmptySearchFetch(true);
    }
  }, [hasValue, searchText, skipInitialSearchWhenValuePresent]);

  React.useEffect(() => {
    const currentResolver = resolverRef.current;

    if (!isOpen || !currentResolver) {
      return;
    }

    const trimmedSearch = searchText.trim();
    if (trimmedSearch.length < searchMinLength) {
      setFetchedOptions(NO_OPTIONS);
      return;
    }

    if (trimmedSearch.length === 0 && skipInitialSearchWhenValuePresent && hasValue && !allowEmptySearchFetch) {
      setFetchedOptions(NO_OPTIONS);
      return;
    }

    let cancelled = false;

    setLoading(true);

    Promise.resolve(currentResolver(searchText))
      .then(nextOptions => {
        if (cancelled) {
          return;
        }

        setFetchedOptions(nextOptions ?? NO_OPTIONS);
      })
      .catch(() => {
        // A failing option loader must not escape as an unhandled rejection: show no matches instead
        // of tearing down the surrounding form.
        if (cancelled) {
          return;
        }

        setFetchedOptions(NO_OPTIONS);
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [allowEmptySearchFetch, hasValue, isOpen, searchMinLength, searchText, skipInitialSearchWhenValuePresent]);

  return {
    loadedOptions: staticOptions ?? fetchedOptions,
    loading: staticOptions ? false : loading,
  };
}

function useSearchText(searchTextProp?: string, onSearchTextChange?: (searchText: string) => void) {
  const [internalSearchText, setInternalSearchText] = React.useState("");
  const searchText = searchTextProp ?? internalSearchText;

  const handleSearchTextChange = React.useCallback(
    (nextSearchText: string) => {
      if (searchTextProp == null) {
        setInternalSearchText(nextSearchText);
      }

      onSearchTextChange?.(nextSearchText);
    },
    [onSearchTextChange, searchTextProp],
  );

  return {
    searchText,
    handleSearchTextChange,
  };
}

function shouldPropagateSearchTextChange(reason: AutocompleteInputChangeReason): boolean {
  return reason === "input" || reason === "clear" || reason === "reset";
}

function useMobilePickerPages<TOption>(
  open: boolean,
  searchText: string,
  loadPage: MobilePageLoader<TOption> | undefined,
) {
  const [options, setOptions] = React.useState<TOption[]>([]);
  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const requestVersionRef = React.useRef(0);

  React.useEffect(() => {
    if (!open || !loadPage) return;

    const requestVersion = ++requestVersionRef.current;
    setLoading(true);
    void loadPage(searchText, 0)
      .then(result => {
        if (requestVersion !== requestVersionRef.current) return;
        setOptions(result.options);
        setPage(0);
        setHasMore(result.hasMore);
      })
      .catch(() => {
        if (requestVersion !== requestVersionRef.current) return;
        setOptions([]);
        setPage(0);
        setHasMore(false);
      })
      .finally(() => {
        if (requestVersion === requestVersionRef.current) setLoading(false);
      });

    return () => {
      if (requestVersion === requestVersionRef.current) {
        requestVersionRef.current += 1;
      }
    };
  }, [loadPage, open, searchText]);

  const loadMore = React.useCallback(async () => {
    if (!loadPage || loading || !hasMore) return;
    const requestVersion = requestVersionRef.current;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const result = await loadPage(searchText, nextPage);
      if (requestVersion !== requestVersionRef.current) return;
      setOptions(current => [...current, ...result.options]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch {
      if (requestVersion === requestVersionRef.current) {
        setHasMore(false);
      }
    } finally {
      if (requestVersion === requestVersionRef.current) setLoading(false);
    }
  }, [hasMore, loadPage, loading, page, searchText]);

  return { options, loading, hasMore, loadMore };
}

/**
 * MUI hands `renderInput` the props that wire the `<input>` to the autocomplete, including the ref it
 * needs to focus and measure the field. Spreading caller overrides on top of them replaces those
 * nested bags wholesale, after which opening the dropdown throws "Unable to find the input element"
 * and takes the surrounding page down with it — so they must be merged, not overwritten.
 */
function mergeTextFieldProps(params: AutocompleteRenderInputParams, overrides: TextFieldProps | undefined) {
  const { inputProps, InputProps, ...rest } = overrides ?? {};

  return {
    ...params,
    ...rest,
    inputProps: { ...params.inputProps, ...inputProps },
    InputProps: { ...params.InputProps, ...InputProps },
  };
}

export function InputAutocomplete<TOption>({
  value,
  onChange,
  options,
  standaloneOptions,
  getOptionLabel,
  isOptionEqualToValue,
  getOptionDisabled,
  renderOption,
  renderMobileOption,
  searchMinLength = 0,
  searchText,
  onSearchTextChange,
  skipInitialSearchWhenValuePresent = false,
  sortOptions = true,
  startAdornment,
  endAdornment,
  mobilePicker,
  disabled,
  error,
  helperText,
  name,
  inputRef,
  onBlur,
  slotProps,
}: InputAutocompleteProps<TOption>) {
  const theme = useTheme();
  const matchesMobileViewport = useMediaQuery(theme.breakpoints.down("sm"));
  const useMobilePicker = mobilePicker != null && (mobilePicker.enabled ?? matchesMobileViewport);
  const [isOpen, setIsOpen] = React.useState(false);
  const mobilePickerOpen = mobilePicker?.open ?? isOpen;
  const setMobilePickerOpen = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      mobilePicker?.onOpenChange?.(open);
    },
    [mobilePicker],
  );
  const { searchText: resolvedSearchText, handleSearchTextChange } = useSearchText(searchText, onSearchTextChange);
  const { loadedOptions, loading } = useAutocompleteSearch(
    options,
    resolvedSearchText,
    isOpen,
    value != null,
    searchMinLength,
    skipInitialSearchWhenValuePresent,
  );

  const resolvedOptions = React.useMemo(
    () =>
      sortAutocompleteOptions(
        mergeOptions(loadedOptions, standaloneOptions, isOptionEqualToValue),
        sortOptions,
        getOptionLabel,
      ),
    [getOptionLabel, isOptionEqualToValue, loadedOptions, sortOptions, standaloneOptions],
  );

  const disableClearable = slotProps?.root?.disableClearable ?? false;
  const mobilePages = useMobilePickerPages(mobilePickerOpen, resolvedSearchText, mobilePicker?.loadPage);
  const { hasMore: mobileHasMore, loadMore: loadMoreMobileOptions } = mobilePages;
  const loadMoreSentinelRef = React.useRef<HTMLDivElement | null>(null);
  const mobileOptions = mobilePicker?.loadPage ? mobilePages.options : resolvedOptions;

  React.useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!useMobilePicker || !mobilePickerOpen || !sentinel || !mobileHasMore) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) void loadMoreMobileOptions();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMoreMobileOptions, mobileHasMore, mobilePickerOpen, useMobilePicker]);

  if (useMobilePicker) {
    const textFieldProps = slotProps?.textField;
    const selectedLabel = value == null ? "" : getOptionLabel(value);

    return (
      <>
        {!mobilePicker.hideTrigger ? (
          <TextField
            {...textFieldProps}
            value={selectedLabel}
            disabled={disabled}
            error={error}
            helperText={helperText}
            name={name}
            inputRef={inputRef}
            onBlur={onBlur}
            onClick={() => {
              if (!disabled) setMobilePickerOpen(true);
            }}
            inputProps={{
              ...textFieldProps?.inputProps,
              readOnly: true,
              role: "combobox",
              "aria-expanded": mobilePickerOpen,
              "aria-haspopup": "dialog",
            }}
            InputProps={{
              ...textFieldProps?.InputProps,
              readOnly: true,
              startAdornment,
              endAdornment,
            }}
            sx={{ cursor: disabled ? undefined : "pointer", ...textFieldProps?.sx }}
          />
        ) : null}

        <Dialog fullScreen open={mobilePickerOpen} onClose={() => setMobilePickerOpen(false)}>
          <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Toolbar sx={{ gap: 1 }}>
              <IconButton edge="start" aria-label={mobilePicker.closeLabel} onClick={() => setMobilePickerOpen(false)}>
                <ArrowBackRoundedIcon />
              </IconButton>
              <Typography component="h2" variant="h6" fontWeight={700} noWrap>
                {mobilePicker.title}
              </Typography>
            </Toolbar>
            <Box sx={{ px: 2, pb: 2 }}>
              <TextField
                fullWidth
                type="search"
                autoFocus
                autoComplete="off"
                value={resolvedSearchText}
                onChange={event => handleSearchTextChange(event.target.value)}
                placeholder={mobilePicker.searchLabel}
                inputProps={{ enterKeyHint: "search" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {resolvedSearchText ? (
                        <IconButton
                          size="small"
                          aria-label={mobilePicker.clearSearchLabel}
                          onClick={() => handleSearchTextChange("")}
                        >
                          <CloseRoundedIcon fontSize="small" />
                        </IconButton>
                      ) : (
                        <SearchIcon sx={{ color: "text.disabled" }} />
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </AppBar>

          <List role="listbox" disablePadding sx={{ flex: 1, overflowY: "auto", py: 1 }}>
            {(mobilePicker.loadPage ? mobilePages.loading && mobileOptions.length === 0 : loading) ? (
              <Box role="status" sx={{ display: "grid", placeItems: "center", py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : null}
            {!loading && !mobilePages.loading && mobileOptions.length === 0 ? (
              <Typography color="text.secondary" sx={{ px: 2, py: 3 }}>
                {mobilePicker.noOptionsLabel}
              </Typography>
            ) : null}
            {mobileOptions.map((option, index) => {
              const selected = value != null && isOptionEqualToValue(option, value);
              const optionDisabled = getOptionDisabled?.(option) ?? false;
              const optionProps = {
                key: index,
                role: "option",
                "aria-selected": selected,
                "aria-disabled": optionDisabled,
                onClick: optionDisabled
                  ? undefined
                  : () => {
                      onChange(option);
                      setMobilePickerOpen(false);
                    },
                style: { padding: "10px 16px", minHeight: 56 },
              } satisfies React.HTMLAttributes<HTMLLIElement> & { key: React.Key };

              if (renderMobileOption) {
                return (
                  <ListItemButton
                    component="li"
                    key={index}
                    role="option"
                    aria-selected={selected}
                    selected={selected}
                    disabled={optionDisabled}
                    onClick={optionProps.onClick}
                    sx={MOBILE_OPTION_BUTTON_SX}
                  >
                    {renderMobileOption(option)}
                  </ListItemButton>
                );
              }

              if (renderOption) {
                return renderOption(optionProps, option, { selected, inputValue: resolvedSearchText, index });
              }

              return (
                <ListItemButton
                  component="li"
                  key={index}
                  role="option"
                  aria-selected={selected}
                  selected={selected}
                  disabled={optionDisabled}
                  onClick={optionProps.onClick}
                  sx={MOBILE_OPTION_BUTTON_SX}
                >
                  <ListItemText primary={getOptionLabel(option)} />
                </ListItemButton>
              );
            })}
            {mobilePicker.loadPage && mobilePages.hasMore ? (
              <Box ref={loadMoreSentinelRef} sx={{ display: "grid", minHeight: 56, placeItems: "center" }}>
                {mobilePages.loading ? <CircularProgress size={24} /> : null}
              </Box>
            ) : null}
          </List>
        </Dialog>
      </>
    );
  }

  return (
    <Autocomplete<TOption, false, boolean, false>
      value={value}
      inputValue={resolvedSearchText}
      onChange={(_, nextValue) => {
        onChange(nextValue);
        setIsOpen(false);
      }}
      options={resolvedOptions}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      getOptionDisabled={getOptionDisabled}
      renderOption={renderOption}
      disableClearable={disableClearable}
      loading={loading}
      open={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      onBlur={onBlur}
      onInputChange={(_, nextSearchText, reason) => {
        if (!shouldPropagateSearchTextChange(reason)) {
          return;
        }

        handleSearchTextChange(nextSearchText);

        if (reason === "input" && nextSearchText.trim().length > 0) {
          setIsOpen(true);
        }
      }}
      filterOptions={candidateOptions => candidateOptions}
      disabled={disabled}
      renderInput={params => {
        const textFieldProps = mergeTextFieldProps(params, slotProps?.textField);

        return (
          <TextField
            {...textFieldProps}
            error={error}
            helperText={helperText}
            name={name ?? textFieldProps.name}
            inputRef={inputRef ?? textFieldProps.inputRef}
            InputProps={{
              ...textFieldProps.InputProps,
              startAdornment: startAdornment ?? textFieldProps.InputProps.startAdornment,
              endAdornment: (
                <>
                  {endAdornment}
                  {loading ? <CircularProgress color="inherit" size={16} sx={{ mr: 1 }} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        );
      }}
    />
  );
}

export function InputAutocompleteMultiple<TOption>({
  value,
  onChange,
  options,
  standaloneOptions,
  getOptionLabel,
  isOptionEqualToValue,
  getOptionDisabled,
  renderOption,
  searchMinLength = 0,
  searchText,
  onSearchTextChange,
  skipInitialSearchWhenValuePresent = false,
  sortOptions = true,
  disabled,
  error,
  helperText,
  onBlur,
  slotProps,
}: InputAutocompleteMultipleProps<TOption>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasSelectedOptions = value.length > 0;
  const { searchText: resolvedSearchText, handleSearchTextChange } = useSearchText(searchText, onSearchTextChange);
  const { loadedOptions, loading } = useAutocompleteSearch(
    options,
    resolvedSearchText,
    isOpen,
    hasSelectedOptions,
    searchMinLength,
    skipInitialSearchWhenValuePresent,
  );

  const resolvedOptions = React.useMemo(
    () =>
      sortAutocompleteOptions(
        mergeOptions(loadedOptions, standaloneOptions, isOptionEqualToValue),
        sortOptions,
        getOptionLabel,
      ),
    [getOptionLabel, isOptionEqualToValue, loadedOptions, sortOptions, standaloneOptions],
  );

  const disableClearable = slotProps?.root?.disableClearable ?? false;

  return (
    <Autocomplete<TOption, true, boolean, false>
      multiple
      disableCloseOnSelect
      value={value}
      inputValue={resolvedSearchText}
      onChange={(_, nextValue) => onChange(nextValue)}
      options={resolvedOptions}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      getOptionDisabled={getOptionDisabled}
      renderOption={renderOption}
      disableClearable={disableClearable}
      loading={loading}
      open={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      onBlur={onBlur}
      onInputChange={(_, nextSearchText, reason) => {
        if (!shouldPropagateSearchTextChange(reason)) {
          return;
        }

        handleSearchTextChange(nextSearchText);

        if (reason === "input" && nextSearchText.trim().length > 0) {
          setIsOpen(true);
        }
      }}
      filterOptions={candidateOptions => candidateOptions}
      disabled={disabled}
      renderInput={params => {
        const textFieldProps = mergeTextFieldProps(params, slotProps?.textField);

        return (
          <TextField
            {...textFieldProps}
            error={error}
            helperText={helperText}
            InputProps={{
              ...textFieldProps.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={16} sx={{ mr: 1 }} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        );
      }}
    />
  );
}
