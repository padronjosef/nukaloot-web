"use client";

import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  LogOut,
  Pencil,
  Star,
  User,
  UserRound,
} from "lucide-react";
import { Button, buttonVariants } from "@/shared/UI/Button";
import { DropdownMenu } from "@/shared/UI/DropdownMenu/DropdownMenu";
import { cn } from "@/shared/lib/utils";
import type { SessionUser } from "@/shared/lib/session-types";
import { logout } from "@/shared/lib/auth-actions";
import { useUIStore } from "@/shared/stores/useUIStore";

/** Matches the view toggle exactly, so the two sit as a pair. */
const TRIGGER_CLASS = cn(
  buttonVariants({ variant: "outline", size: "icon" }),
  "relative size-10 shrink-0 rounded p-0",
);

type UserMenuProps = {
  user: SessionUser | null;
  canSeeAdmin: boolean;
};

export const UserMenu = ({ user, canSeeAdmin }: UserMenuProps) => {
  const router = useRouter();
  const setSignInOpen = useUIStore((s) => s.setSignInOpen);

  if (!user) {
    // Spelled out: no icon on its own reads unmistakably as "sign in". The
    // dialog itself lives in the shell, rendered once for both headers.
    return (
      <Button
        variant="outline"
        className="h-10 shrink-0 gap-1.5 rounded px-3"
        onClick={() => setSignInOpen(true)}
      >
        <UserRound className="size-4" />
        Sign in
      </Button>
    );
  }

  return (
    <DropdownMenu
      align="end"
      // The popup is anchored to a 40px icon button, so without the width it
      // inherits that and the email gets clipped. The padding overrides are
      // scoped to this menu rather than changing the shared component.
      className={cn(
        "w-auto min-w-60 max-w-[18rem] p-1.5",
        "[&_[data-slot=dropdown-menu-item]]:px-2.5 [&_[data-slot=dropdown-menu-item]]:py-2 [&_[data-slot=dropdown-menu-item]]:gap-2.5",
        "[&_[data-slot=dropdown-menu-label]]:px-2.5 [&_[data-slot=dropdown-menu-label]]:py-2",
        "[&_[data-slot=dropdown-menu-separator]]:-mx-1.5",
      )}
      triggerClassName={TRIGGER_CLASS}
      triggerLabel={`Account: ${user.name || user.email}`}
      trigger={<User className="size-5" />}
      items={[
        // Who you are sits on its own, with a rule under it: it is a heading,
        // not something you can pick.
        {
          label: (
            <span className="flex min-w-0 flex-col gap-0.5 py-0.5">
              <span className="truncate text-sm font-medium text-foreground">
                {user.name || "Your account"}
              </span>
              <span className="truncate text-[0.8rem] leading-tight font-normal text-muted-foreground">
                {user.email}
              </span>
            </span>
          ),
          items: [],
        },
        {
          items: [
            {
              key: "edit",
              label: "Edit profile",
              icon: <Pencil />,
              onSelect: () => router.push("/account"),
            },
            {
              key: "favourites",
              label: "Tracked games",
              icon: <Star />,
              onSelect: () => router.push("/account/favourites"),
            },
            {
              key: "alarms",
              label: "Price alarms",
              icon: <Bell />,
              onSelect: () => router.push("/account/alarms"),
            },
            // Offered only to whoever can actually open it; the panel and every
            // /api/admin route check the same permission for themselves.
            ...(canSeeAdmin
              ? [
                  {
                    key: "admin",
                    label: "Admin Panel",
                    icon: <BarChart3 />,
                    onSelect: () => router.push("/admin"),
                  },
                ]
              : []),
          ],
        },
        {
          key: "logout",
          label: "Sign out",
          icon: <LogOut />,
          variant: "destructive" as const,
          onSelect: () => void logout(),
        },
      ]}
    />
  );
};
