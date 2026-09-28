import { AppShell } from "../components/header/organisms/AppShell";
import { getSession } from "@/shared/lib/admin-api";
import { googleEnabled } from "@/shared/lib/google";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  // Read once on the server so the header knows who is signed in without a
  // round-trip, and without the menu flashing in after the page paints.
  const session = await getSession();

  return (
    <AppShell
      user={session?.user ?? null}
      canSeeAdmin={session?.permissions.includes("VIEW_ANALYTICS") ?? false}
      googleEnabled={googleEnabled()}
    >
      {children}
    </AppShell>
  );
};

export default MainLayout;
