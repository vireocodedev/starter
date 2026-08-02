import { type RgoNationality } from "@/features/i18next/models/RgoNationality";
import { type RgoLocale } from "@/setup/config/RgoLocale";
import { getCountryName, getFlagComponent } from "@/utils/countryutils";
import { Tooltip, type TooltipProps } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import "./RgoNationalityFlag.css";

export type RgoNationalityFlagSlotProps = Partial<{
  tooltip: Omit<TooltipProps, "children" | "title">;
}>;

export type RgoNationalityFlagProps = {
  countryCode: RgoNationality | null;
  width?: number;
  height?: number;
  rotation?: number;
  rgoSlotProps?: RgoNationalityFlagSlotProps;
};

const WIDTH = 22;
const HEIGHT = 16.5;

const RgoUnknownFlag = () => (
  <svg width={WIDTH} height={HEIGHT}>
    <rect width={WIDTH} height={HEIGHT} fill="#CCCCCC" />
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="0.625rem" fill="#666666">
      ?
    </text>
  </svg>
);

export function RgoNationalityFlag({
  countryCode,
  width,
  height,
  rotation = 0,
  rgoSlotProps,
}: RgoNationalityFlagProps) {
  const { i18n } = useTranslation();
  const tooltipProps = rgoSlotProps?.tooltip ?? {};

  const FlagComponent = React.useMemo(() => {
    if (!countryCode) {
      return null;
    }
    const flag = getFlagComponent(countryCode);
    if (!flag) {
      console.warn(`Flag for country code "${countryCode}" not found.`);
      return null;
    }
    return flag;
  }, [countryCode]);

  if (!countryCode) {
    return <RgoUnknownFlag />;
  }

  const countryName = getCountryName(countryCode, i18n.language as RgoLocale);

  const flagElement = FlagComponent ? (
    <FlagComponent
      width={width ?? WIDTH}
      height={height ?? HEIGHT}
      style={{ transform: `rotate(${rotation}deg)`, borderRadius: "4px", overflow: "visible" }}
    />
  ) : (
    <RgoUnknownFlag />
  );

  return (
    <Tooltip title={countryName} {...tooltipProps}>
      <span style={{ display: "inline-flex" }}>{flagElement}</span>
    </Tooltip>
  );
}
