"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, UserCheck, UserPlus, UserX } from "lucide-react";
import type { AdminUser } from "@/shared/lib/admin-api";
import { Badge } from "@/shared/UI/Badge";
import { Button } from "@/shared/UI/Button";
import { Dialog } from "@/shared/UI/Dialog/Dialog";
import { Skeleton } from "@/shared/UI/Skeleton";
import { Panel, PanelEmpty } from "../atoms/Panel";
import { TablePagination, usePaginated } from "../molecules/TablePagination";
import { Table, Td, Th } from "../atoms/Table";
import { RoleBadge } from "../atoms/RoleBadge";
import { UserForm, type UserFormValues } from "../molecules/UserForm";
import { absoluteTime, relativeTime } from "../../lib/format";

export const UsersView = ({ currentUserId }: { currentUserId: string }) => {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [pending, setPending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  const { visible, page, pages, setPage, total, pageSize } = usePaginated(
    users ?? [],
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const body = (await res.json()) as AdminUser[] | { error: string };
      if (!res.ok) throw new Error((body as { error: string }).error);
      setUsers(body as AdminUser[]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load the users.",
      );
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Every write reports: a silent failure here is someone locked out. */
  const mutate = async (
    request: () => Promise<Response>,
    success: string,
  ): Promise<boolean> => {
    setPending(true);
    try {
      const res = await request();
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "The change could not be saved.");
      }
      toast.success(success);
      await load();
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The change could not be saved.",
      );
      return false;
    } finally {
      setPending(false);
    }
  };

  const createUser = async (values: UserFormValues) => {
    const done = await mutate(
      () =>
        fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: values.email,
            name: values.name || undefined,
            role: values.role,
            password: values.password,
          }),
        }),
      `${values.email} can now sign in.`,
    );
    if (done) setCreating(false);
  };

  const updateUser = async (user: AdminUser, values: UserFormValues) => {
    const done = await mutate(
      () =>
        fetch(`/api/admin/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            ...(user.id === currentUserId ? {} : { role: values.role }),
            ...(values.password ? { password: values.password } : {}),
          }),
        }),
      "Saved.",
    );
    if (done) setEditing(null);
  };

  const setActive = (user: AdminUser, isActive: boolean) =>
    mutate(
      () =>
        fetch(`/api/admin/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        }),
      isActive
        ? `${user.email} can sign in again.`
        : `${user.email} is blocked.`,
    );

  const deleteUser = async (user: AdminUser) => {
    const done = await mutate(
      () => fetch(`/api/admin/users/${user.id}`, { method: "DELETE" }),
      `${user.email} was deleted.`,
    );
    if (done) setDeleting(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">
            Who can open this panel. Admins also manage this list.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} className="shrink-0">
          <UserPlus />
          New user
        </Button>
      </div>

      <Panel title="Accounts">
        {users === null ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <PanelEmpty>No accounts yet</PanelEmpty>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Person</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Last sign-in</Th>
                <Th>Created</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((user) => {
                const isSelf = user.id === currentUserId;

                return (
                  <tr key={user.id}>
                    <Td>
                      <span className="block">
                        {user.name || "—"}
                        {isSelf ? (
                          <span className="ml-2 text-xs text-muted-foreground">
                            you
                          </span>
                        ) : null}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </Td>
                    <Td>
                      <RoleBadge role={user.role} />
                    </Td>
                    <Td>
                      <div className="flex flex-wrap items-center gap-1">
                        {user.isActive ? (
                          <Badge variant="outline">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Blocked</Badge>
                        )}
                        {/* Shown only when it is a problem: an account that
                            never confirmed cannot sign in and is swept away. */}
                        {user.emailVerified ? null : (
                          <Badge variant="destructive">Unconfirmed</Badge>
                        )}
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap text-muted-foreground">
                      {user.lastLoginAt ? (
                        relativeTime(user.lastLoginAt)
                      ) : (
                        <span className="italic">never</span>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-muted-foreground">
                      {absoluteTime(user.createdAt)}
                    </Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${user.email}`}
                          onClick={() => setEditing(user)}
                          disabled={pending}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={
                            user.isActive
                              ? `Block ${user.email}`
                              : `Unblock ${user.email}`
                          }
                          onClick={() => void setActive(user, !user.isActive)}
                          // Blocking yourself is the one mistake this panel
                          // cannot undo, so it is not offered.
                          disabled={pending || isSelf}
                        >
                          {user.isActive ? <UserX /> : <UserCheck />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${user.email}`}
                          onClick={() => setDeleting(user)}
                          disabled={pending || isSelf}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
        <TablePagination
          page={page}
          pages={pages}
          total={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </Panel>

      <Dialog
        open={creating}
        onOpenChange={setCreating}
        title="New user"
        description="They sign in with this email and password."
      >
        <UserForm
          pending={pending}
          onSubmit={(values) => void createUser(values)}
          onCancel={() => setCreating(false)}
        />
      </Dialog>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={editing?.email}
        description={
          editing?.id === currentUserId
            ? "You cannot change your own role."
            : undefined
        }
      >
        {editing ? (
          <UserForm
            user={editing}
            pending={pending}
            onSubmit={(values) => void updateUser(editing, values)}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this account?"
        description={`${deleting?.email} will lose access immediately. This cannot be undone — blocking them keeps the account instead.`}
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setDeleting(null)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => deleting && void deleteUser(deleting)}
            disabled={pending}
          >
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
