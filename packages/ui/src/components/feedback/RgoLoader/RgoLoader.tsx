import { Box, CircularProgress } from "@mui/material";
import "./RgoLoader.css";

export type RgoLoaderProps = {
  containerWidth?: string | number;
  containerHeight?: string | number;
  loaderSize?: string | number;
};

function getComputedValue(value: string | number | null | undefined, defaultValue: string | number): string {
  if (value === null || value === undefined || value === "") {
    const stringValue = String(defaultValue);

    if (isNaN(Number(stringValue))) {
      return stringValue;
    }

    return `${defaultValue}px`;
  }

  const stringValue = String(value);

  if (isNaN(Number(stringValue))) {
    return stringValue;
  }

  return `${value}px`;
}

export function RgoLoader({ containerWidth = "100%", containerHeight = "100%", loaderSize = "3rem" }: RgoLoaderProps) {
  const computedContainerWidth = getComputedValue(containerWidth, "100%");
  const computedContainerHeight = getComputedValue(containerHeight, "100%");
  const computedLoaderSize = getComputedValue(loaderSize, "3rem");

  return (
    <Box width={computedContainerWidth} height={computedContainerHeight} className="loader">
      <CircularProgress size={computedLoaderSize} />
    </Box>
  );
}
