import { RgoTruncatedText } from "@/components/data-display/RgoTruncatedText/RgoTruncatedText";
import { Box, Stack } from "@mui/material";

const shortText = "This is a short text that should not trigger truncation.";
const mediumText = `This is a medium-length text that demonstrates the truncation functionality. It should be long enough to trigger the truncation when maxRows is set to 2, but not excessively long. This allows users to see how the component handles moderately sized content.`;

export const RgoTruncatedTextWithNoTruncationDemo = () => {
  return (
    <Stack spacing={3}>
      <Box>
        <h3>Short Text (No truncation needed)</h3>
        <RgoTruncatedText text={shortText} maxWidth={400} />
      </Box>

      <Box>
        <h3>Medium Text with High Row Limit (No truncation)</h3>
        <RgoTruncatedText text={mediumText} maxWidth={400} maxRows={10} />
      </Box>

      <Box>
        <h3>Medium Text with Wide Container (No truncation)</h3>
        <RgoTruncatedText text={mediumText} maxWidth={800} maxRows={2} />
      </Box>

      <Box>
        <h3>Medium Text with Very Wide Container (Single line)</h3>
        <RgoTruncatedText text={mediumText} maxWidth="100%" maxRows={2} />
      </Box>
    </Stack>
  );
};

export const RgoTruncatedTextWithNoTruncationDemoCode = `import { RgoTruncatedText } from "@/components/data-display/RgoTruncatedText/RgoTruncatedText";
import { Box, Stack } from "@mui/material";

const shortText = "This is a short text that should not trigger truncation.";
const mediumText = \`This is a medium-length text that demonstrates the truncation functionality. It should be long enough to trigger the truncation when maxRows is set to 2, but not excessively long. This allows users to see how the component handles moderately sized content.\`;

export const RgoTruncatedTextWithNoTruncationDemo = () => {
  return (
    <Stack spacing={3}>
      <Box>
        <h3>Short Text (No truncation needed)</h3>
        <RgoTruncatedText text={shortText} maxWidth={400} />
      </Box>

      <Box>
        <h3>Medium Text with High Row Limit (No truncation)</h3>
        <RgoTruncatedText text={mediumText} maxWidth={400} maxRows={10} />
      </Box>

      <Box>
        <h3>Medium Text with Wide Container (No truncation)</h3>
        <RgoTruncatedText text={mediumText} maxWidth={800} maxRows={2} />
      </Box>

      <Box>
        <h3>Medium Text with Very Wide Container (Single line)</h3>
        <RgoTruncatedText text={mediumText} maxWidth="100%" maxRows={2} />
      </Box>
    </Stack>
  );
};`;
