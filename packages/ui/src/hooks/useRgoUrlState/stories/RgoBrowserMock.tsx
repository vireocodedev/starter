import { useSearchParamsHistory } from "@/hooks/useRgoUrlState/stories/useRgoSearchParamsHistory";
import { ArrowBack, ArrowForward, Refresh } from "@mui/icons-material";
import { Box, IconButton, Paper, TextField } from "@mui/material";
import React from "react";
import { useLocation } from "react-use";

export type RgoBrowserMockProps = {
  children: React.ReactNode;
  includedUrlParams?: string[];
};

export function RgoBrowserMock({ children, includedUrlParams = [] }: RgoBrowserMockProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedIncludedUrlParams = React.useMemo(() => includedUrlParams, []);
  const { search } = useLocation();
  const { onBack, onForward, canGoBack, canGoForward, onRefresh } = useSearchParamsHistory();

  const searchParamsString = React.useMemo(() => {
    const searchParams = new URLSearchParams(search);
    if (memoizedIncludedUrlParams.length > 0) {
      [...searchParams.entries()].forEach(([key]) => {
        if (!memoizedIncludedUrlParams.includes(key)) {
          searchParams.delete(key);
        }
      });
    }
    return searchParams.toString();
  }, [search, memoizedIncludedUrlParams]);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", my: 8 }}>
      {/* Browser Chrome */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid #e0e0e0",
        }}
      >
        {/* Browser Top Bar */}
        <Box
          sx={{
            backgroundColor: "#f5f5f5",
            borderBottom: "1px solid #e0e0e0",
            p: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {/* Navigation Buttons */}
          <IconButton size="small" disabled={!canGoBack} onClick={onBack}>
            <ArrowBack fontSize="small" />
          </IconButton>
          <IconButton size="small" disabled={!canGoForward} onClick={onForward}>
            <ArrowForward fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onRefresh}>
            <Refresh fontSize="small" />
          </IconButton>

          {/* Address Bar */}
          <Box sx={{ flex: 1, mx: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={`https://example.com/${searchParamsString.length === 0 ? "" : `?${searchParamsString}`}`}
              InputProps={{
                readOnly: true,
                sx: ({ palette }) => ({
                  backgroundColor: palette.getContrastText(palette.primary.main),
                  borderRadius: 3,
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "1px solid #d0d0d0",
                  },
                }),
              }}
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: "0.875rem",
                  fontFamily: "monospace",
                },
              }}
            />
          </Box>
        </Box>

        {/* Page Content */}
        <Box sx={{ p: 3, backgroundColor: "white" }}>{children}</Box>
      </Paper>
    </Box>
  );
}
