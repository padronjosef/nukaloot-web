import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/shared/lib/admin-api";
import { UsersView } from "../../components/templates/UsersView";

export const metadata: Metadata = {
  title: "Users · Nuka Loot",
};

const UsersPage = async () => {
  // Belt and braces: the nav hides this and every /api/admin/users call checks
  // the same permission, but the page does not take that on trust.
  const session = await getSession();
  if (!session) redirect("/?signin=1&next=/admin/users");
  if (!session.permissions.includes("MANAGE_ACCESS")) redirect("/admin");

  return <UsersView currentUserId={session.user.id} />;
};

export default UsersPage;
