import { RgoPageHeader } from "@/components/layout/RgoPageHeader/RgoPageHeader";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconButton } from "@mui/material";

export function RgoPageHeaderWithBackButtonDemo() {
  return (
    <RgoPageHeader
      title="Page Title"
      backButton={
        <IconButton size="small" onClick={() => alert("Back clicked")}>
          <ArrowBackIcon />
        </IconButton>
      }
    />
  );
}

export const RgoPageHeaderWithBackButtonDemoCode = `
import { RgoPageHeader } from "@vireocodedev/starter-ui";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export function RgoPageHeaderWithBackButtonDemo() {
  return (
    <RgoPageHeader
      title="Page Title"
      backButton={
        <IconButton size="small" onClick={() => alert("Back clicked")}>
          <ArrowBackIcon />
        </IconButton>
      }
    />
  );
}`;
