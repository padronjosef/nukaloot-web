import { redirect } from "next/navigation";
import { getSession } from "@/shared/lib/admin-api";
import { AdminNav } from "../components/organisms/AdminNav";

/**
 * The proxy only proved the cookie was signed here. This is where the account
 * is read back from the database, so deactivating someone takes effect on
 * their next request rather than whenever their cookie expires.
 */
const PanelLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();
  if (!session) redirect("/?signin=1&next=/admin");
  // Being signed in is not enough: a plain `user` account has no business here.
  if (!session.permissions.includes("VIEW_ANALYTICS")) redirect("/");

  return (
    <div className="flex min-h-screen flex-col">
      <AdminNav
        user={session.user}
        canManageAccess={session.permissions.includes("MANAGE_ACCESS")}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default PanelLayout;
