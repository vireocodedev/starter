import { RgoTruncatedText } from "@/components/data-display/RgoTruncatedText/RgoTruncatedText";
import { Box, Stack } from "@mui/material";

const mediumText = `This is a medium-length text that demonstrates the truncation functionality. It should be long enough to trigger the truncation when maxRows is set to 2, but not excessively long. This allows users to see how the component handles moderately sized content.`;

export const RgoTruncatedTextWithCustomActionTextDemo = () => {
  return (
    <Stack spacing={3}>
      <Box>
        <h3>Default Action Text</h3>
        <RgoTruncatedText text={mediumText} maxWidth={350} />
      </Box>

      <Box>
        <h3>Custom Action Text (English)</h3>
        <RgoTruncatedText text={mediumText} maxWidth={350} viewMoreText="Show More" viewLessText="Show Less" />
      </Box>

      <Box>
        <h3>Custom Action Text (Spanish)</h3>
        <RgoTruncatedText text={mediumText} maxWidth={350} viewMoreText="Ver Más" viewLessText="Ver Menos" />
      </Box>

      <Box>
        <h3>Custom Action Text (French)</h3>
        <RgoTruncatedText text={mediumText} maxWidth={350} viewMoreText="Voir Plus" viewLessText="Voir Moins" />
      </Box>
    </Stack>
  );
};

export const RgoTruncatedTextWithCustomActionTextDemoCode = `import { RgoTruncatedText } from "@/components/data-display/RgoTruncatedText/RgoTruncatedText";
import { Box, Stack } from "@mui/material";

const mediumText = \`This is a medium-length text that demonstrates the truncation functionality. It should be long enough to trigger the truncation when maxRows is set to 2, but not excessively long. This allows users to see how the component handles moderately sized content.\`;

export const RgoTruncatedTextWithCustomActionTextDemo = () => {
  return (
    <Stack spacing={3}>
      <Box>
        <h3>Default Action Text</h3>
        <RgoTruncatedText text={mediumText} maxWidth={350} />
      </Box>

      <Box>
        <h3>Custom Action Text (English)</h3>
        <RgoTruncatedText
          text={mediumText}
          maxWidth={350}
          viewMoreText="Show More"
          viewLessText="Show Less"
        />
      </Box>

      <Box>
        <h3>Custom Action Text (Spanish)</h3>
        <RgoTruncatedText
          text={mediumText}
          maxWidth={350}
          viewMoreText="Ver Más"
          viewLessText="Ver Menos"
        />
      </Box>

      <Box>
        <h3>Custom Action Text (French)</h3>
        <RgoTruncatedText
          text={mediumText}
          maxWidth={350}
          viewMoreText="Voir Plus"
          viewLessText="Voir Moins"
        />
      </Box>
    </Stack>
  );
};`;
