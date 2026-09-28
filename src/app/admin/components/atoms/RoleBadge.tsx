import { Bell, Eye, ShieldCheck } from "lucide-react";
import type { UserRole } from "@/shared/lib/admin-api";
import { Badge } from "@/shared/UI/Badge";

/** Icon and wording live here so a role looks the same in every table and form. */
const ROLE_APPEARANCE: Record<
  UserRole,
  { label: string; icon: typeof Eye; variant: "default" | "outline" | "ghost" }
> = {
  admin: { label: "Admin", icon: ShieldCheck, variant: "default" },
  operator: { label: "Operator", icon: Eye, variant: "outline" },
  user: { label: "User", icon: Bell, variant: "ghost" },
};

export const ROLE_HINTS: Record<UserRole, string> = {
  admin: "Sees the analytics and manages who else gets in.",
  operator: "Sees the analytics only.",
  user: "Their own profile and price alarms. No access to this panel.",
};

export const RoleBadge = ({ role }: { role: UserRole }) => {
  const appearance = ROLE_APPEARANCE[role] ?? ROLE_APPEARANCE.user;
  const Icon = appearance.icon;

  return (
    <Badge variant={appearance.variant}>
      <Icon />
      {appearance.label}
    </Badge>
  );
};
