import { RgoValueWithUnit } from "@/components/data-display/RgoValueWithUnit/RgoValueWithUnit";
import { Box, Stack, Typography } from "@mui/material";

export const RgoValueWithUnitWithEmptyAndInvalidValuesDemo = () => {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Empty and Invalid Values</Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        <div>
          <Typography variant="body2" color="text.secondary">
            Null value:
          </Typography>
          <RgoValueWithUnit value={null} unit="kg" />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Undefined value:
          </Typography>
          <RgoValueWithUnit value={undefined} unit="m" />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Null with decimal precision:
          </Typography>
          <RgoValueWithUnit value={null} unit="°C" toFixed={2} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Undefined with decimal precision:
          </Typography>
          <RgoValueWithUnit value={undefined} unit="%" toFixed={1} />
        </div>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
        Note: When value is null or undefined, only a dash (-) is displayed without the unit.
      </Typography>
    </Stack>
  );
};

export const RgoValueWithUnitWithEmptyAndInvalidValuesDemoCode = `import { RgoValueWithUnit } from "@/components/data-display/RgoValueWithUnit/RgoValueWithUnit";
import { Box, Stack, Typography } from "@mui/material";

export const RgoValueWithUnitWithEmptyAndInvalidValuesDemo = () => {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Empty and Invalid Values</Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        <div>
          <Typography variant="body2" color="text.secondary">
            Null value:
          </Typography>
          <RgoValueWithUnit value={null} unit="kg" />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Undefined value:
          </Typography>
          <RgoValueWithUnit value={undefined} unit="m" />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Null with decimal precision:
          </Typography>
          <RgoValueWithUnit value={null} unit="°C" toFixed={2} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Undefined with decimal precision:
          </Typography>
          <RgoValueWithUnit value={undefined} unit="%" toFixed={1} />
        </div>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        Note: When value is null or undefined, only a dash (-) is displayed without the unit.
      </Typography>
    </Stack>
  );
};`;
