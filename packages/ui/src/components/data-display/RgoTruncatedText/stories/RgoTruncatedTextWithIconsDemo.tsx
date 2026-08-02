import { RgoTruncatedText } from "@/components/data-display/RgoTruncatedText/RgoTruncatedText";
import { Article, CheckCircle, Error, Info, Warning } from "@mui/icons-material";
import { Box, Stack } from "@mui/material";

const mediumText = `This is a medium-length text that demonstrates the truncation functionality. It should be long enough to trigger the truncation when maxRows is set to 2, but not excessively long. This allows users to see how the component handles moderately sized content.`;

export const RgoTruncatedTextWithIconsDemo = () => {
  return (
    <Stack spacing={3}>
      <Box>
        <h3>Info Icon</h3>
        <RgoTruncatedText text={mediumText} startIcon={<Info fontSize="small" color="info" />} maxWidth={350} />
      </Box>

      <Box>
        <h3>Warning Icon</h3>
        <RgoTruncatedText text={mediumText} startIcon={<Warning fontSize="small" color="warning" />} maxWidth={350} />
      </Box>

      <Box>
        <h3>Success Icon</h3>
        <RgoTruncatedText
          text={mediumText}
          startIcon={<CheckCircle fontSize="small" color="success" />}
          maxWidth={350}
        />
      </Box>

      <Box>
        <h3>Error Icon</h3>
        <RgoTruncatedText text={mediumText} startIcon={<Error fontSize="small" color="error" />} maxWidth={350} />
      </Box>

      <Box>
        <h3>Article Icon</h3>
        <RgoTruncatedText text={mediumText} startIcon={<Article fontSize="small" color="primary" />} maxWidth={350} />
      </Box>
    </Stack>
  );
};

export const RgoTruncatedTextWithIconsDemoCode = `import { RgoTruncatedText } from "@/components/data-display/RgoTruncatedText/RgoTruncatedText";
import { Article, CheckCircle, Error, Info, Warning } from "@mui/icons-material";
import { Box, Stack } from "@mui/material";

const mediumText = \`This is a medium-length text that demonstrates the truncation functionality. It should be long enough to trigger the truncation when maxRows is set to 2, but not excessively long. This allows users to see how the component handles moderately sized content.\`;

export const RgoTruncatedTextWithIconsDemo = () => {
  return (
    <Stack spacing={3}>
      <Box>
        <h3>Info Icon</h3>
        <RgoTruncatedText text={mediumText} startIcon={<Info fontSize="small" color="info" />} maxWidth={350} />
      </Box>

      <Box>
        <h3>Warning Icon</h3>
        <RgoTruncatedText text={mediumText} startIcon={<Warning fontSize="small" color="warning" />} maxWidth={350} />
      </Box>

      <Box>
        <h3>Success Icon</h3>
        <RgoTruncatedText
          text={mediumText}
          startIcon={<CheckCircle fontSize="small" color="success" />}
          maxWidth={350}
        />
      </Box>

      <Box>
        <h3>Error Icon</h3>
        <RgoTruncatedText text={mediumText} startIcon={<Error fontSize="small" color="error" />} maxWidth={350} />
      </Box>

      <Box>
        <h3>Article Icon</h3>
        <RgoTruncatedText
          text={mediumText}
          startIcon={<Article fontSize="small" color="primary" />}
          maxWidth={350}
        />
      </Box>
    </Stack>
  );
};`;
