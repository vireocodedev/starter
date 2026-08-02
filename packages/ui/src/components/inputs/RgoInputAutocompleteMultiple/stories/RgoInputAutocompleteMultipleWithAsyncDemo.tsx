import { RgoLabelBox } from "@/components/data-display/RgoLabelBox/RgoLabelBox";
import {
  RgoInputAutocompleteMultiple,
  type RgoInputAutocompleteMultipleProps,
} from "@/components/inputs/RgoInputAutocompleteMultiple/RgoInputAutocompleteMultiple";
import { Avatar, Chip } from "@mui/material";
import React from "react";

type User = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
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
  { id: 9, name: "George Harris", email: "george.harris@example.com" },
  { id: 10, name: "Helen Jones", email: "helen.jones@example.com" },
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

type RgoInputAutocompleteMultipleWithAsyncDemoProps = Partial<
  Omit<
    RgoInputAutocompleteMultipleProps<User>,
    | "value"
    | "onChange"
    | "searchText"
    | "onSearchTextChange"
    | "options"
    | "getOptionLabel"
    | "isOptionEqualToValue"
    | "renderOption"
  >
>;

export function RgoInputAutocompleteMultipleWithAsyncDemo(props: RgoInputAutocompleteMultipleWithAsyncDemoProps = {}) {
  const [value, setValue] = React.useState<User[]>([]);
  const [searchText, setSearchText] = React.useState("");

  return (
    <RgoLabelBox label="Search and select multiple users">
      <RgoInputAutocompleteMultiple
        {...props}
        value={value}
        onChange={setValue}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        options={searchUsers}
        searchMinLength={2}
        debounceDelay={300}
        getOptionLabel={user => user.name}
        isOptionEqualToValue={(user, value) => user.id === value.id}
        renderOption={(props, user) => (
          <li {...props} key={user.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar sx={{ width: 32, height: 32 }}>{user.name.charAt(0).toUpperCase()}</Avatar>
            <div>
              <div style={{ fontWeight: 500 }}>{user.name}</div>
              <div style={{ fontSize: "0.875rem", color: "text.secondary" }}>{user.email}</div>
            </div>
          </li>
        )}
        rgoSlotProps={{
          root: {
            renderTags: (value, getTagProps) =>
              value.map((user, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={user.id}
                  variant="outlined"
                  label={user.name}
                  avatar={<Avatar sx={{ width: 20, height: 20, fontSize: "10px" }}>{user.name.charAt(0)}</Avatar>}
                  size="small"
                />
              )),
          },
        }}
      />
    </RgoLabelBox>
  );
}

export const RgoInputAutocompleteMultipleWithAsyncDemoCode = `import { RgoLabelBox, RgoInputAutocompleteMultiple, type RgoInputAutocompleteMultipleProps } from "@vireocodedev/starter-ui";
import { Chip, Avatar } from "@mui/material";
import React from "react";

type User = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
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
  { id: 9, name: "George Harris", email: "george.harris@example.com" },
  { id: 10, name: "Helen Jones", email: "helen.jones@example.com" },
];

// Mock async function to search users
const searchUsers = async (searchText: string): Promise<User[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (searchText.trim().length < 2) {
    return [];
  }

  return mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
  );
};

type RgoInputAutocompleteMultipleWithAsyncDemoProps = Partial<Omit<RgoInputAutocompleteMultipleProps<User>, "value" | "onChange" | "searchText" | "onSearchTextChange" | "options" | "getOptionLabel" | "isOptionEqualToValue" | "renderOption">>;

export function RgoInputAutocompleteMultipleWithAsyncDemo(props: RgoInputAutocompleteMultipleWithAsyncDemoProps = {}) {
  const [value, setValue] = React.useState<User[]>([]);
  const [searchText, setSearchText] = React.useState("");

  return (
    <RgoLabelBox label="Search and select multiple users">
      <RgoInputAutocompleteMultiple
        {...props}
        value={value}
        onChange={setValue}
        searchText={searchText}
        onSearchTextChange={setSearchText}
        options={searchUsers}
        searchMinLength={2}
        debounceDelay={300}
        getOptionLabel={(user) => user.name}
        isOptionEqualToValue={(user, value) => user.id === value.id}
        renderOption={(props, user) => (
          <li {...props} key={user.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar sx={{ width: 32, height: 32 }}>{user.name.charAt(0).toUpperCase()}</Avatar>
            <div>
              <div style={{ fontWeight: 500 }}>{user.name}</div>
              <div style={{ fontSize: "0.875rem", color: "text.secondary" }}>{user.email}</div>
            </div>
          </li>
        )}
        rgoSlotProps={{
          root: {
            renderTags: (value, getTagProps) =>
              value.map((user, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={user.id}
                  variant="outlined"
                  label={user.name}
                  avatar={<Avatar sx={{ width: 20, height: 20, fontSize: "10px" }}>{user.name.charAt(0)}</Avatar>}
                  size="small"
                />
              )),
          },
        }}
      />
    </RgoLabelBox>
  );
}`;
