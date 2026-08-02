import { useRgoDebounce } from "@/hooks/useRgoDebounce/useRgoDebounce";
import { Box, Paper, TextField, Typography } from "@mui/material";
import React from "react";

export const UseDebounceWithDefaultPropsDemo = () => {
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedValue, setDebouncedValue] = React.useState("");
  const [callCount, setCallCount] = React.useState(0);

  const debouncedUpdate = useRgoDebounce((value: string) => {
    setDebouncedValue(value);
    setCallCount(prev => prev + 1);
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    debouncedUpdate(e.target.value);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, maxWidth: 500 }}>
      <Typography variant="h6" gutterBottom>
        Debounced Search
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Type quickly — the debounced value updates only after 500ms of inactivity.
      </Typography>

      <TextField fullWidth label="Search" value={inputValue} onChange={handleChange} placeholder="Type something..." />

      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2">
          <strong>Input value:</strong> {inputValue || "(empty)"}
        </Typography>
        <Typography variant="body2">
          <strong>Debounced value:</strong> {debouncedValue || "(empty)"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Debounce callback fired <strong>{callCount}</strong> time(s)
        </Typography>
      </Box>
    </Paper>
  );
};

export const UseDebounceWithDefaultPropsDemoCode = `import { useRgoDebounce } from "@vireocodedev/starter-ui";
import React from "react";

function SearchComponent() {
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedValue, setDebouncedValue] = React.useState("");

  const debouncedUpdate = useRgoDebounce((value: string) => {
    setDebouncedValue(value);
  }, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    debouncedUpdate(e.target.value);
  };

  return (
    <div>
      <input value={inputValue} onChange={handleChange} />
      <p>Debounced: {debouncedValue}</p>
    </div>
  );
}`;
