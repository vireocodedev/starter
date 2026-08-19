import { RgoLabelBox } from "@/core/public";
import {
  RgoInputSelectMultiple,
  type RgoInputSelectMultipleProps,
} from "@/components/inputs/RgoInputSelectMultiple/RgoInputSelectMultiple";
import { Avatar, Box, Typography } from "@mui/material";
import React from "react";

type Option = {
  id: number;
  name: string;
  emoji: string;
  color: string;
};

const options: Option[] = [
  { id: 1, name: "Apple", emoji: "🍎", color: "#ff6b6b" },
  { id: 2, name: "Banana", emoji: "🍌", color: "#ffd93d" },
  { id: 3, name: "Cherry", emoji: "🍒", color: "#ff6b9d" },
  { id: 4, name: "Grape", emoji: "🍇", color: "#a8e6cf" },
  { id: 5, name: "Orange", emoji: "🍊", color: "#ffb74d" },
];

type RgoInputSelectMultipleWithRenderOptionDemoProps = Partial<
  Omit<RgoInputSelectMultipleProps<Option, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">
>;

export function RgoInputSelectMultipleWithRenderOptionDemo(
  props: RgoInputSelectMultipleWithRenderOptionDemoProps = {},
) {
  const [value, setValue] = React.useState<number[]>([]);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSelectMultiple
        {...props}
        options={options}
        renderOption={option => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, backgroundColor: option.color, fontSize: "12px" }}>
              {option.emoji}
            </Avatar>
            <Typography>{option.name}</Typography>
          </Box>
        )}
        renderValue={option => option.id}
        value={value}
        onChange={setValue}
      />
    </RgoLabelBox>
  );
}

export const RgoInputSelectMultipleWithRenderOptionDemoCode = `
import { RgoLabelBox, RgoInputSelectMultiple, type RgoInputSelectMultipleProps } from "@vireocodedev/starter-ui";
import { Avatar, Box, Typography } from "@mui/material";
import React from "react";

type Option = {
  id: number;
  name: string;
  emoji: string;
  color: string;
};

const options: Option[] = [
  { id: 1, name: "Apple", emoji: "🍎", color: "#ff6b6b" },
  { id: 2, name: "Banana", emoji: "🍌", color: "#ffd93d" },
  { id: 3, name: "Cherry", emoji: "🍒", color: "#ff6b9d" },
  { id: 4, name: "Grape", emoji: "🍇", color: "#a8e6cf" },
  { id: 5, name: "Orange", emoji: "🍊", color: "#ffb74d" },
];

type RgoInputSelectMultipleWithRenderOptionDemoProps = Partial<Omit<RgoInputSelectMultipleProps<Option, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">>;

export function RgoInputSelectMultipleWithRenderOptionDemo(props: RgoInputSelectMultipleWithRenderOptionDemoProps = {}) {
  const [value, setValue] = React.useState<number[]>([]);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSelectMultiple
        {...props}
        options={options}
        renderOption={(option) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, backgroundColor: option.color, fontSize: "12px" }}>
              {option.emoji}
            </Avatar>
            <Typography>{option.name}</Typography>
          </Box>
        )}
        renderValue={(option) => option.id}
        value={value}
        onChange={setValue}
      />
    </RgoLabelBox>
  );
}`;
