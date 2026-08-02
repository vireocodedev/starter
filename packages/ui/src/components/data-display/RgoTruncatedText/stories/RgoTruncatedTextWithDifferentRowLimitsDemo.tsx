import { RgoTruncatedText } from "@/components/data-display/RgoTruncatedText/RgoTruncatedText";
import { Box, Stack } from "@mui/material";

const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`;

export const RgoTruncatedTextWithDifferentRowLimitsDemo = () => {
  return (
    <Stack spacing={3}>
      <Box>
        <h3>1 Row Maximum</h3>
        <RgoTruncatedText text={longText} maxRows={1} maxWidth={400} />
      </Box>

      <Box>
        <h3>2 Rows Maximum (Default)</h3>
        <RgoTruncatedText text={longText} maxRows={2} maxWidth={400} />
      </Box>

      <Box>
        <h3>3 Rows Maximum</h3>
        <RgoTruncatedText text={longText} maxRows={3} maxWidth={400} />
      </Box>

      <Box>
        <h3>5 Rows Maximum</h3>
        <RgoTruncatedText text={longText} maxRows={5} maxWidth={400} />
      </Box>
    </Stack>
  );
};

export const RgoTruncatedTextWithDifferentRowLimitsDemoCode = `import { RgoTruncatedText } from "@/components/data-display/RgoTruncatedText/RgoTruncatedText";
import { Box, Stack } from "@mui/material";

const longText = \`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.\`;

export const RgoTruncatedTextWithDifferentRowLimitsDemo = () => {
  return (
    <Stack spacing={3}>
      <Box>
        <h3>1 Row Maximum</h3>
        <RgoTruncatedText text={longText} maxRows={1} maxWidth={400} />
      </Box>

      <Box>
        <h3>2 Rows Maximum (Default)</h3>
        <RgoTruncatedText text={longText} maxRows={2} maxWidth={400} />
      </Box>

      <Box>
        <h3>3 Rows Maximum</h3>
        <RgoTruncatedText text={longText} maxRows={3} maxWidth={400} />
      </Box>

      <Box>
        <h3>5 Rows Maximum</h3>
        <RgoTruncatedText text={longText} maxRows={5} maxWidth={400} />
      </Box>
    </Stack>
  );
};`;
