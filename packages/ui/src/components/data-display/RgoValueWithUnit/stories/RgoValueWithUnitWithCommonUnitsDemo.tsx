import { RgoValueWithUnit } from "@/components/data-display/RgoValueWithUnit/RgoValueWithUnit";
import { Box, Stack, Typography } from "@mui/material";

export const RgoValueWithUnitWithCommonUnitsDemo = () => {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Common Unit Examples</Typography>
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
        <div>
          <Typography variant="body2" color="text.secondary">
            Weight:
          </Typography>
          <RgoValueWithUnit value={75.2} unit="kg" toFixed={1} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Distance:
          </Typography>
          <RgoValueWithUnit value={1500.5} unit="km" toFixed={1} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Temperature:
          </Typography>
          <RgoValueWithUnit value={23.5} unit="°C" toFixed={1} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Percentage:
          </Typography>
          <RgoValueWithUnit value={87.3} unit="%" toFixed={1} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Time:
          </Typography>
          <RgoValueWithUnit value={42} unit="minutes" />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Speed:
          </Typography>
          <RgoValueWithUnit value={120.7} unit="km/h" toFixed={1} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            File Size:
          </Typography>
          <RgoValueWithUnit value={1024} unit="MB" />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Currency:
          </Typography>
          <RgoValueWithUnit value={299.99} unit="USD" toFixed={2} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Pressure:
          </Typography>
          <RgoValueWithUnit value={1013.25} unit="hPa" toFixed={2} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Energy:
          </Typography>
          <RgoValueWithUnit value={2500} unit="kWh" />
        </div>
      </Box>
    </Stack>
  );
};

export const RgoValueWithUnitWithCommonUnitsDemoCode = `import { RgoValueWithUnit } from "@/components/data-display/RgoValueWithUnit/RgoValueWithUnit";
import { Box, Stack, Typography } from "@mui/material";

export const RgoValueWithUnitWithCommonUnitsDemo = () => {
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Common Unit Examples</Typography>
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
        <div>
          <Typography variant="body2" color="text.secondary">
            Weight:
          </Typography>
          <RgoValueWithUnit value={75.2} unit="kg" toFixed={1} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Distance:
          </Typography>
          <RgoValueWithUnit value={1500.5} unit="km" toFixed={1} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Temperature:
          </Typography>
          <RgoValueWithUnit value={23.5} unit="°C" toFixed={1} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Percentage:
          </Typography>
          <RgoValueWithUnit value={87.3} unit="%" toFixed={1} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Time:
          </Typography>
          <RgoValueWithUnit value={42} unit="minutes" />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Speed:
          </Typography>
          <RgoValueWithUnit value={120.7} unit="km/h" toFixed={1} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            File Size:
          </Typography>
          <RgoValueWithUnit value={1024} unit="MB" />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Currency:
          </Typography>
          <RgoValueWithUnit value={299.99} unit="USD" toFixed={2} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Pressure:
          </Typography>
          <RgoValueWithUnit value={1013.25} unit="hPa" toFixed={2} />
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Energy:
          </Typography>
          <RgoValueWithUnit value={2500} unit="kWh" />
        </div>
      </Box>
    </Stack>
  );
};`;
