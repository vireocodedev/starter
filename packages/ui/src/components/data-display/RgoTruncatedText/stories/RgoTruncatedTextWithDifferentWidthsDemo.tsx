import { RgoTruncatedText } from "@/components/data-display/RgoTruncatedText/RgoTruncatedText";
import { Box, Stack } from "@mui/material";

const mediumText = `This is a medium-length text that demonstrates the truncation functionality. It should be long enough to trigger the truncation when maxRows is set to 2, but not excessively long. This allows users to see how the component handles moderately sized content.`;

export const RgoTruncatedTextWithDifferentWidthsDemo = () => {
  return (
    <Stack spacing={3}>
      <Box>
        <h3>Narrow Width (200px)</h3>
        <RgoTruncatedText text={mediumText} maxWidth={200} />
      </Box>

      <Box>
        <h3>Medium Width (400px)</h3>
        <RgoTruncatedText text={mediumText} maxWidth={400} />
      </Box>

      <Box>
        <h3>Wide Width (600px)</h3>
        <RgoTruncatedText text={mediumText} maxWidth={600} />
      </Box>

      <Box>
        <h3>Full Width (100%)</h3>
        <RgoTruncatedText text={mediumText} maxWidth="100%" />
      </Box>
    </Stack>
  );
};

export const RgoTruncatedTextWithDifferentWidthsDemoCode = `import { RgoTruncatedText } from "@/components/data-display/RgoTruncatedText/RgoTruncatedText";
import { Box, Stack } from "@mui/material";

const mediumText = \`This is a medium-length text that demonstrates the truncation functionality. It should be long enough to trigger the truncation when maxRows is set to 2, but not excessively long. This allows users to see how the component handles moderately sized content.\`;

export const RgoTruncatedTextWithDifferentWidthsDemo = () => {
  return (
    <Stack spacing={3}>
      <Box>
        <h3>Narrow Width (200px)</h3>
        <RgoTruncatedText text={mediumText} maxWidth={200} />
      </Box>

      <Box>
        <h3>Medium Width (400px)</h3>
        <RgoTruncatedText text={mediumText} maxWidth={400} />
      </Box>

      <Box>
        <h3>Wide Width (600px)</h3>
        <RgoTruncatedText text={mediumText} maxWidth={600} />
      </Box>

      <Box>
        <h3>Full Width (100%)</h3>
        <RgoTruncatedText text={mediumText} maxWidth="100%" />
      </Box>
    </Stack>
  );
};`;
