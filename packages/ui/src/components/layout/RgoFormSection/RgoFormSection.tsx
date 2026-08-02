import { composeSx } from "@/utils/muiutils";
import { Box, type BoxProps, Typography, type TypographyProps } from "@mui/material";
import "./RgoFormSection.css";

export type RgoFormSectionSlotProps = Partial<{
  root: Omit<BoxProps, "children">;
  label: Omit<TypographyProps, "children">;
  content: Omit<BoxProps, "children">;
}>;

export type RgoFormSectionProps = {
  children: React.ReactNode;
  label?: string;
  rgoSlotProps?: RgoFormSectionSlotProps;
};

export function RgoFormSection({ children, label, rgoSlotProps }: RgoFormSectionProps) {
  const rootProps = rgoSlotProps?.root || {};
  const labelProps = rgoSlotProps?.label || {};
  const contentProps = rgoSlotProps?.content || {};
  const trimmedLabel = label?.trim() || "";

  return (
    <Box
      {...rootProps}
      sx={composeSx(rootProps.sx, {
        display: "flex",
        flexDirection: "column",
        gap: 2,
      })}
    >
      {trimmedLabel && (
        <Typography
          {...labelProps}
          sx={composeSx(labelProps.sx, {
            fontWeight: 600,
            lineHeight: "1.75rem",
            fontSize: "1.125rem",
          })}
        >
          {trimmedLabel}
        </Typography>
      )}

      <Box
        {...contentProps}
        sx={composeSx(contentProps.sx, theme => ({
          display: "flex",
          flexDirection: "column",
          borderRadius: `${theme.shape.borderRadius}px`,
          backgroundColor: theme.palette.background.paper,
          outline: `thin solid ${theme.palette.grey[300]}`,
          gap: 1,
          p: 3,
        }))}
      >
        {children}
      </Box>
    </Box>
  );
}
