import { RgoLabelBox } from "@/core/public";
import { RgoInputSelect, type RgoInputSelectProps } from "@/components/inputs/RgoInputSelect/RgoInputSelect";
import { Avatar, Box, Typography } from "@mui/material";
import React from "react";

type Fruit = {
  id: number;
  name: string;
  emoji: string;
  color: string;
};

const fruits: Fruit[] = [
  { id: 1, name: "Apple", emoji: "🍎", color: "#ff4444" },
  { id: 2, name: "Banana", emoji: "🍌", color: "#ffeb3b" },
  { id: 3, name: "Cherry", emoji: "🍒", color: "#e91e63" },
  { id: 4, name: "Orange", emoji: "🍊", color: "#ff9800" },
  { id: 5, name: "Grape", emoji: "🍇", color: "#9c27b0" },
];

type RgoInputSelectWithRenderOptionDemoProps = Partial<
  Omit<RgoInputSelectProps<Fruit, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">
>;

export function RgoInputSelectWithRenderOptionDemo(props: RgoInputSelectWithRenderOptionDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  const renderOption = (fruit: Fruit) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Avatar sx={{ width: 24, height: 24, backgroundColor: fruit.color }}>
        <Typography variant="caption">{fruit.emoji}</Typography>
      </Avatar>
      <Typography variant="body2">{fruit.name}</Typography>
    </Box>
  );

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSelect
        {...props}
        options={fruits}
        renderOption={renderOption}
        renderValue={fruit => fruit.id}
        value={value}
        onChange={setValue}
      />
    </RgoLabelBox>
  );
}

export const RgoInputSelectWithRenderOptionDemoCode = `
import { RgoLabelBox, RgoInputSelect, type RgoInputSelectProps } from "@vireocodedev/starter-ui";
import { Avatar, Box, Typography } from "@mui/material";
import React from "react";

type Fruit = {
  id: number;
  name: string;
  emoji: string;
  color: string;
};

const fruits: Fruit[] = [
  { id: 1, name: "Apple", emoji: "🍎", color: "#ff4444" },
  { id: 2, name: "Banana", emoji: "🍌", color: "#ffeb3b" },
  { id: 3, name: "Cherry", emoji: "🍒", color: "#e91e63" },
  { id: 4, name: "Orange", emoji: "🍊", color: "#ff9800" },
  { id: 5, name: "Grape", emoji: "🍇", color: "#9c27b0" },
];

type RgoInputSelectWithRenderOptionDemoProps = Partial<
  Omit<RgoInputSelectProps<Fruit, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">
>;

export function RgoInputSelectWithRenderOptionDemo(props: RgoInputSelectWithRenderOptionDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  const renderOption = (fruit: Fruit) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Avatar sx={{ width: 24, height: 24, backgroundColor: fruit.color }}>
        <Typography variant="caption">{fruit.emoji}</Typography>
      </Avatar>
      <Typography variant="body2">{fruit.name}</Typography>
    </Box>
  );

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSelect
        {...props}
        options={fruits}
        renderOption={renderOption}
        renderValue={fruit => fruit.id}
        value={value}
        onChange={setValue}
      />
    </RgoLabelBox>
  );
}`;
