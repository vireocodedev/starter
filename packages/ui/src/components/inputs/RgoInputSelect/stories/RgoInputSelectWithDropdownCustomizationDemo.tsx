import { RgoLabelBox } from "@/core/public";
import { RgoInputSelect, type RgoInputSelectProps } from "@/components/inputs/RgoInputSelect/RgoInputSelect";
import React from "react";

type Category = {
  id: number;
  name: string;
  description: string;
};

const categories: Category[] = [
  { id: 1, name: "Electronics", description: "Computers, phones, and gadgets" },
  { id: 2, name: "Clothing", description: "Shirts, pants, and accessories" },
  { id: 3, name: "Books", description: "Fiction, non-fiction, and educational" },
  { id: 4, name: "Home & Garden", description: "Furniture, tools, and decorations" },
  { id: 5, name: "Sports", description: "Equipment and athletic wear" },
  { id: 6, name: "Food", description: "Groceries and specialty items" },
  { id: 7, name: "Health", description: "Medicines and wellness products" },
  { id: 8, name: "Toys", description: "Games and children's items" },
];

type RgoInputSelectWithDropdownCustomizationDemoProps = Partial<
  Omit<RgoInputSelectProps<Category, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">
>;

export function RgoInputSelectWithDropdownCustomizationDemo(
  props: RgoInputSelectWithDropdownCustomizationDemoProps = {},
) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSelect
        {...props}
        options={categories}
        renderOption={category => category.name}
        renderValue={category => category.id}
        value={value}
        onChange={setValue}
      />
    </RgoLabelBox>
  );
}

export const RgoInputSelectWithDropdownCustomizationDemoCode = `
import { RgoLabelBox, RgoInputSelect, type RgoInputSelectProps } from "@vireocodedev/starter-ui";
import React from "react";

type Category = {
  id: number;
  name: string;
  description: string;
};

const categories: Category[] = [
  { id: 1, name: "Electronics", description: "Computers, phones, and gadgets" },
  { id: 2, name: "Clothing", description: "Shirts, pants, and accessories" },
  { id: 3, name: "Books", description: "Fiction, non-fiction, and educational" },
  { id: 4, name: "Home & Garden", description: "Furniture, tools, and decorations" },
  { id: 5, name: "Sports", description: "Equipment and athletic wear" },
  { id: 6, name: "Food", description: "Groceries and specialty items" },
  { id: 7, name: "Health", description: "Medicines and wellness products" },
  { id: 8, name: "Toys", description: "Games and children's items" },
];

type RgoInputSelectWithDropdownCustomizationDemoProps = Partial<
  Omit<RgoInputSelectProps<Category, number>, "value" | "onChange" | "options" | "renderOption" | "renderValue">
>;

export function RgoInputSelectWithDropdownCustomizationDemo(props: RgoInputSelectWithDropdownCustomizationDemoProps = {}) {
  const [value, setValue] = React.useState<number | null>(null);

  return (
    <RgoLabelBox label="Input field">
      <RgoInputSelect
        {...props}
        options={categories}
        renderOption={category => category.name}
        renderValue={category => category.id}
        value={value}
        onChange={setValue}
        optionHeight={60}
        optionPadding={12}
        dropdownMaxItemsVisible={4}
      />
    </RgoLabelBox>
  );
}`;
