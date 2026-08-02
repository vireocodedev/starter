import { RgoValueWithUnit } from "@/components/data-display/RgoValueWithUnit/RgoValueWithUnit";
import { Box, Stack, Typography } from "@mui/material";

export const RgoValueWithUnitWithDecimalPrecisionDemo = () => {
  const testValue = 123.456789;

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Decimal Precision Examples</Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        <div>
          <Typography variant="body2" color="text.secondary">
            No decimal places (default):
          </Typography>
          <RgoValueWithUnit value={testValue} unit="kg" />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            1 decimal place:
          </Typography>
          <RgoValueWithUnit value={testValue} unit="kg" toFixed={1} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            2 decimal places:
          </Typography>
          <RgoValueWithUnit value={testValue} unit="kg" toFixed={2} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            3 decimal places:
          </Typography>
          <RgoValueWithUnit value={testValue} unit="kg" toFixed={3} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            5 decimal places:
          </Typography>
          <RgoValueWithUnit value={123.4} unit="kg" toFixed={5} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Zero with precision:
          </Typography>
          <RgoValueWithUnit value={0} unit="mm" toFixed={3} />
        </div>
      </Box>
    </Stack>
  );
};

export const RgoValueWithUnitWithDecimalPrecisionDemoCode = `import { RgoValueWithUnit } from "@/components/data-display/RgoValueWithUnit/RgoValueWithUnit";
import { Box, Stack, Typography } from "@mui/material";

export const RgoValueWithUnitWithDecimalPrecisionDemo = () => {
  const testValue = 123.456789;

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Decimal Precision Examples</Typography>
      <Box display="flex" flexDirection="column" gap={1}>
        <div>
          <Typography variant="body2" color="text.secondary">
            No decimal places (default):
          </Typography>
          <RgoValueWithUnit value={testValue} unit="kg" />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            1 decimal place:
          </Typography>
          <RgoValueWithUnit value={testValue} unit="kg" toFixed={1} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            2 decimal places:
          </Typography>
          <RgoValueWithUnit value={testValue} unit="kg" toFixed={2} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            3 decimal places:
          </Typography>
          <RgoValueWithUnit value={testValue} unit="kg" toFixed={3} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            5 decimal places:
          </Typography>
          <RgoValueWithUnit value={123.4} unit="kg" toFixed={5} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Zero with precision:
          </Typography>
          <RgoValueWithUnit value={0} unit="mm" toFixed={3} />
        </div>
      </Box>
    </Stack>
  );
};`;
