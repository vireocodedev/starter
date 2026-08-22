import { type AppConfig } from "@/config/app.config.types";
import { AppLayoutNav } from "@/shell/layout/AppLayoutNav";
import { VireoBottomDrawer } from "@vireocodedev/starter-ui";

export function AppMobileNavDrawer({
  config,
  loginMode,
  onClose,
  open,
}: {
  config: AppConfig;
  loginMode: boolean;
  onClose: () => void;
  open: boolean;
}) {
  return (
    <VireoBottomDrawer
      open={open}
      onClose={onClose}
      height="auto"
      maxHeight={config.brand.navigation.drawerMaxHeight}
      useBackdrop
    >
      <AppLayoutNav
        width="100%"
        collapsed={false}
        mobile
        loginMode={loginMode}
        onNavigate={onClose}
        onClose={onClose}
      />
    </VireoBottomDrawer>
  );
}
