import { RgoValueWithUnit } from "@/components/data-display/RgoValueWithUnit/RgoValueWithUnit";
import { Box, Stack, Typography } from "@mui/material";

export const RgoValueWithUnitWithDifferentValueTypesDemo = () => {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Different Value Types</Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        <div>
          <Typography variant="body2" color="text.secondary">
            Integer value:
          </Typography>
          <RgoValueWithUnit value={150} unit="kg" />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Decimal value:
          </Typography>
          <RgoValueWithUnit value={3.14159} unit="π" toFixed={3} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Zero value:
          </Typography>
          <RgoValueWithUnit value={0} unit="°C" toFixed={1} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Large number:
          </Typography>
          <RgoValueWithUnit value={1234567.89} unit="bytes" toFixed={2} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Small decimal:
          </Typography>
          <RgoValueWithUnit value={0.001} unit="mm" toFixed={3} />
        </div>
      </Box>
    </Stack>
  );
};

export const RgoValueWithUnitWithDifferentValueTypesDemoCode = `import { RgoValueWithUnit } from "@/components/data-display/RgoValueWithUnit/RgoValueWithUnit";
import { Box, Stack, Typography } from "@mui/material";

export const RgoValueWithUnitWithDifferentValueTypesDemo = () => {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Different Value Types</Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        <div>
          <Typography variant="body2" color="text.secondary">
            Integer value:
          </Typography>
          <RgoValueWithUnit value={150} unit="kg" />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Decimal value:
          </Typography>
          <RgoValueWithUnit value={3.14159} unit="π" toFixed={3} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Zero value:
          </Typography>
          <RgoValueWithUnit value={0} unit="°C" toFixed={1} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Large number:
          </Typography>
          <RgoValueWithUnit value={1234567.89} unit="bytes" toFixed={2} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Small decimal:
          </Typography>
          <RgoValueWithUnit value={0.001} unit="mm" toFixed={3} />
        </div>
      </Box>
    </Stack>
  );
};`;
