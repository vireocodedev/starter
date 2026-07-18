import { useResponsiveProps } from "@/hooks/useResponsiveProps";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  type TextFieldProps,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { usePlatformTranslation } from "@vireocodedev/starter-localization";
import dayjs, { type Dayjs } from "dayjs";
import React from "react";

const WHEEL_ITEM_HEIGHT = 48;
const WHEEL_VISIBLE_ITEMS = 5;

type MonthYearView = "month" | "year";

type WheelOption = {
  value: number;
  label: string;
  disabled?: boolean;
};

type WheelColumnProps = {
  ariaLabel: string;
  onChange: (value: number) => void;
  options: WheelOption[];
  value: number;
};

function WheelColumn({ ariaLabel, onChange, options, value }: WheelColumnProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const scrollRafRef = React.useRef<number | null>(null);
  const initialIndexRef = React.useRef(
    Math.max(
      0,
      options.findIndex(option => option.value === value),
    ),
  );

  React.useLayoutEffect(() => {
    if (rootRef.current) {
      rootRef.current.scrollTop = initialIndexRef.current * WHEEL_ITEM_HEIGHT;
    }

    return () => {
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  const selectOption = React.useCallback(
    (option: WheelOption, index: number) => {
      if (option.disabled) {
        return;
      }

      onChange(option.value);
      rootRef.current?.scrollTo?.({ top: index * WHEEL_ITEM_HEIGHT, behavior: "smooth" });
    },
    [onChange],
  );

  const handleScroll = React.useCallback(() => {
    if (!rootRef.current || scrollRafRef.current !== null) {
      return;
    }

    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const root = rootRef.current;

      if (!root) {
        return;
      }

      const index = Math.max(0, Math.min(options.length - 1, Math.round(root.scrollTop / WHEEL_ITEM_HEIGHT)));
      const option = options[index];

      if (!option.disabled && option.value !== value) {
        onChange(option.value);
      }
    });
  }, [onChange, options, value]);

  return (
    <Box sx={{ position: "relative", flex: 1, minWidth: 0 }}>
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          zIndex: 1,
          top: WHEEL_ITEM_HEIGHT * 2,
          right: 0,
          left: 0,
          height: WHEEL_ITEM_HEIGHT,
          borderTop: "1px solid var(--mui-palette-grey-300)",
          borderBottom: "1px solid var(--mui-palette-grey-300)",
          bgcolor: "action.hover",
          pointerEvents: "none",
        }}
      />
      <Box
        ref={rootRef}
        role="listbox"
        aria-label={ariaLabel}
        onScroll={handleScroll}
        sx={{
          position: "relative",
          zIndex: 2,
          height: WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ITEMS,
          overflowY: "auto",
          overflowX: "hidden",
          scrollSnapType: "y mandatory",
          overscrollBehavior: "contain",
          scrollbarWidth: "none",
          py: `${WHEEL_ITEM_HEIGHT * 2}px`,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {options.map((option, index) => {
          const selected = option.value === value;

          return (
            <Button
              key={option.value}
              role="option"
              aria-selected={selected}
              disabled={option.disabled}
              color={selected ? "primary" : "inherit"}
              onClick={() => selectOption(option, index)}
              sx={{
                display: "flex",
                width: "100%",
                height: WHEEL_ITEM_HEIGHT,
                minWidth: 0,
                borderRadius: 0,
                scrollSnapAlign: "center",
                fontSize: selected ? "1rem" : "0.875rem",
                fontWeight: selected ? 700 : 400,
                opacity: selected ? 1 : 0.58,
                textTransform: "none",
              }}
            >
              {option.label}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
}

export type ResponsiveMonthYearPickerProps = {
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  views: MonthYearView[];
  openTo?: MonthYearView;
  format: string;
  monthLabel: string;
  yearLabel: string;
  disableFuture?: boolean;
  disabled?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  textFieldComponent?: React.ElementType;
  textFieldProps?: TextFieldProps;
};

export function ResponsiveMonthYearPicker({
  value,
  onChange,
  views,
  openTo,
  format,
  monthLabel,
  yearLabel,
  disableFuture = false,
  disabled = false,
  minDate = dayjs("1900-01-01"),
  maxDate = dayjs("2099-12-31"),
  textFieldComponent,
  textFieldProps,
}: ResponsiveMonthYearPickerProps) {
  const { t } = usePlatformTranslation();
  const [open, setOpen] = React.useState(false);
  const [draftValue, setDraftValue] = React.useState<Dayjs>(() => value ?? dayjs());
  const effectiveMaxDate = disableFuture && dayjs().isBefore(maxDate, "day") ? dayjs() : maxDate;
  const clampedMinDate = minDate.isAfter(effectiveMaxDate, "day") ? effectiveMaxDate : minDate;
  const clampValue = React.useCallback(
    (candidate: Dayjs) => {
      if (candidate.isBefore(clampedMinDate, "month")) {
        return clampedMinDate;
      }

      if (candidate.isAfter(effectiveMaxDate, "month")) {
        return effectiveMaxDate;
      }

      return candidate;
    },
    [clampedMinDate, effectiveMaxDate],
  );

  const openPicker = React.useCallback(() => {
    if (disabled) {
      return;
    }

    setDraftValue(clampValue(value ?? dayjs()));
    setOpen(true);
  }, [clampValue, disabled, value]);

  const yearOptions = React.useMemo<WheelOption[]>(() => {
    const minYear = clampedMinDate.year();
    const maxYear = effectiveMaxDate.year();

    return Array.from({ length: maxYear - minYear + 1 }, (_, index) => {
      const year = minYear + index;
      return { value: year, label: String(year) };
    });
  }, [clampedMinDate, effectiveMaxDate]);

  const monthOptions = React.useMemo<WheelOption[]>(() => {
    return Array.from({ length: 12 }, (_, month) => {
      const candidate = draftValue.month(month);
      return {
        value: month,
        label: candidate.format("MMMM"),
        disabled: candidate.isBefore(clampedMinDate, "month") || candidate.isAfter(effectiveMaxDate, "month"),
      };
    });
  }, [clampedMinDate, draftValue, effectiveMaxDate]);
  const selectableMonthOptions = React.useMemo(() => monthOptions.filter(option => !option.disabled), [monthOptions]);

  const TriggerField = textFieldComponent ?? TextField;
  const mobilePicker = (
    <>
      <TriggerField
        {...textFieldProps}
        value={value?.format(format) ?? ""}
        disabled={disabled || textFieldProps?.disabled}
        onClick={(event: React.MouseEvent<HTMLDivElement>) => {
          textFieldProps?.onClick?.(event);
          openPicker();
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          textFieldProps?.onKeyDown?.(event);

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        inputProps={{
          ...textFieldProps?.inputProps,
          readOnly: true,
        }}
        InputProps={{
          ...textFieldProps?.InputProps,
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton aria-label={textFieldProps?.label?.toString()} edge="end" disabled={disabled} tabIndex={-1}>
                <CalendarMonthRoundedIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ cursor: disabled ? undefined : "pointer", ...textFieldProps?.sx }}
      />
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogContent sx={{ px: 2, py: 2.5 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            {views.includes("month") && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography align="center" variant="caption" color="text.secondary" fontWeight={700}>
                  {monthLabel}
                </Typography>
                <WheelColumn
                  ariaLabel={monthLabel}
                  options={selectableMonthOptions}
                  value={draftValue.month()}
                  onChange={month => setDraftValue(current => clampValue(current.month(month)))}
                />
              </Box>
            )}
            {views.includes("year") && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography align="center" variant="caption" color="text.secondary" fontWeight={700}>
                  {yearLabel}
                </Typography>
                <WheelColumn
                  ariaLabel={yearLabel}
                  options={yearOptions}
                  value={draftValue.year()}
                  onChange={year => setDraftValue(current => clampValue(current.year(year)))}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onChange(draftValue);
              setOpen(false);
            }}
          >
            {t("common.done")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  const desktopPicker = (
    <DatePicker
      value={value}
      onChange={onChange}
      views={views}
      openTo={openTo}
      format={format}
      disableFuture={disableFuture}
      disabled={disabled}
      minDate={minDate}
      maxDate={maxDate}
      slots={textFieldComponent ? { textField: textFieldComponent } : undefined}
      slotProps={{ textField: textFieldProps }}
    />
  );

  return useResponsiveProps<React.ReactNode>({ mobile: mobilePicker, desktop: desktopPicker });
}
