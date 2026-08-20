import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchIcon from "@mui/icons-material/Search";
import { Box, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { RgoLabelBox } from "@/core/public";
import { useRgoDebounce } from "@/hooks/useRgoDebounce/useRgoDebounce";
import { usePlatformTranslation } from "@vireocodedev/starter-localization";
import React from "react";

export type ManagementSearchToolbarProps = {
  title: string;
  searchText: string;
  searchPlaceholder: string;
  onSearchTextChange: (value: string) => void;
  createButton?: React.ReactNode;
  hideTitle?: boolean;
  showSearchLabel?: boolean;
  hideCreate?: boolean;
  debounceMs?: number;
};

export function ManagementSearchToolbar({
  title,
  searchText: committedSearchText,
  searchPlaceholder,
  onSearchTextChange,
  createButton,
  hideTitle = false,
  showSearchLabel = false,
  hideCreate = false,
  debounceMs = 300,
}: ManagementSearchToolbarProps) {
  const { t } = usePlatformTranslation();
  const [searchText, setSearchText] = React.useState(committedSearchText);

  React.useEffect(() => {
    setSearchText(committedSearchText);
  }, [committedSearchText]);

  const commitSearchText = useRgoDebounce((value: string) => {
    onSearchTextChange(value);
  }, debounceMs);

  const handleSearchTextChange = (value: string) => {
    setSearchText(value);
    commitSearchText(value);
  };

  const clearSearchText = () => {
    setSearchText("");
    commitSearchText("");
    onSearchTextChange("");
  };

  const searchInput = (
    <TextField
      value={searchText}
      onChange={event => handleSearchTextChange(event.target.value)}
      type="search"
      autoComplete="off"
      placeholder={searchPlaceholder}
      sx={{ width: "100%", maxWidth: hideTitle ? "none" : 600 }}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              {searchText ? (
                <IconButton size="small" aria-label={t("common.clearSearch")} onClick={clearSearchText}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              ) : (
                <SearchIcon sx={{ color: "text.disabled" }} />
              )}
            </InputAdornment>
          ),
        },
      }}
    />
  );

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} width="100%">
      {!hideTitle && <Typography fontWeight={600}>{title}</Typography>}

      <Box display="flex" alignItems="center" gap={1.5} flex={1} justifyContent="flex-end">
        {showSearchLabel ? (
          <Box flex={1} minWidth={0}>
            <RgoLabelBox label={t("common.search")}>{searchInput}</RgoLabelBox>
          </Box>
        ) : (
          searchInput
        )}

        {!hideCreate && createButton ? createButton : null}
      </Box>
    </Box>
  );
}
