"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LogOut, UserCog } from "lucide-react";
import type { AdminUser } from "@/shared/lib/admin-api";
import { Button } from "@/shared/UI/Button";
import { cn } from "@/shared/lib/utils";
import { logout } from "@/shared/lib/auth-actions";
import { BrandMark } from "@/app/components/shared/atoms/BrandMark";

type AdminNavProps = {
  user: AdminUser;
  canManageAccess: boolean;
};

export const AdminNav = ({ user, canManageAccess }: AdminNavProps) => {
  const pathname = usePathname();

  // Users is offered only to whoever can manage access; the API enforces the
  // same permission independently on every call.
  const links = [
    { href: "/admin", label: "Analytics", icon: BarChart3 },
    ...(canManageAccess
      ? [{ href: "/admin/users", label: "Users", icon: UserCog }]
      : []),
  ];

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5">
        <Link href="/" aria-label="Back to Nukaloot">
          <BrandMark size="sm" />
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {user.name || user.email}
          </span>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
};
