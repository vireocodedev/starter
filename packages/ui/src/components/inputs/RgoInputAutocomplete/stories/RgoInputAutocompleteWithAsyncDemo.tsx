import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import {
  RgoInputAutocomplete,
  type RgoInputAutocompleteProps,
} from "@/components/inputs/RgoInputAutocomplete/RgoInputAutocomplete";
import React from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

// Mock users database
const mockUsers: User[] = [
  { id: 1, name: "John Doe", email: "john.doe@example.com" },
  { id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
  { id: 3, name: "Bob Johnson", email: "bob.johnson@example.com" },
  { id: 4, name: "Alice Brown", email: "alice.brown@example.com" },
  { id: 5, name: "Charlie Wilson", email: "charlie.wilson@example.com" },
  { id: 6, name: "Diana Davis", email: "diana.davis@example.com" },
  { id: 7, name: "Edward Miller", email: "edward.miller@example.com" },
  { id: 8, name: "Fiona Garcia", email: "fiona.garcia@example.com" },
];

// Mock async function to search users
const searchUsers = async (searchText: string): Promise<User[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  if (searchText.trim().length < 2) {
    return [];
  }

  return mockUsers.filter(
    user =>
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()),
  );
};

type RgoInputAutocompleteWithAsyncDemoProps = Partial<
  Omit<
    RgoInputAutocompleteProps<User>,
    "value" | "onChange" | "searchText" | "onSearchTextChange" | "options" | "getOptionLabel" | "isOptionEqualToValue"
  >
>;

export function RgoInputAutocompleteWithAsyncDemo(props: RgoInputAutocompleteWithAsyncDemoProps = {}) {
  const [value, setValue] = React.useState<User | null>(null);
  const [searchText, setSearchText] = React.useState("");

  return (
    <RgoLabelBox label="User">
      <RgoInputAutocomplete
        {...props}
        value={value}
        onChange={setValue}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        options={searchUsers}
        getOptionLabel={option => `${option.name} (${option.email})`}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        searchMinLength={2}
        debounceDelay={300}
        helperText="Try typing 'example' to see suggestions."
      />
    </RgoLabelBox>
  );
}

export const RgoInputAutocompleteWithAsyncDemoCode = `import { RgoLabelBox, RgoInputAutocomplete } from "@vireocodedev/starter-ui";
import React from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

// Mock async function to search users
const searchUsers = async (searchText: string): Promise<User[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (searchText.trim().length < 2) {
    return [];
  }
  
  // Your API call logic here
  const response = await fetch(\`/api/users/search?q=\${searchText}\`);
  return response.json();
};

export function MyComponent() {
  const [value, setValue] = React.useState<User | null>(null);
  const [searchText, setSearchText] = React.useState("");

  return (
    <RgoLabelBox label="User">
      <RgoInputAutocomplete
        value={value}
        onChange={setValue}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        options={searchUsers}
        getOptionLabel={(option) => \`\${option.name} (\${option.email})\`}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        searchMinLength={2}
        debounceDelay={300}
        helperText="Try typing 'example' to see suggestions."
      />
    </RgoLabelBox>
  );
}`;
