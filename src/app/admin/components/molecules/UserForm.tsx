"use client";

import { useState } from "react";
import type { AdminUser, UserRole } from "@/shared/lib/admin-api";
import { Button } from "@/shared/UI/Button";
import { Input } from "@/shared/UI/Input";
import { Select } from "@/shared/UI/Select/Select";
import { ROLE_HINTS } from "../atoms/RoleBadge";

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "operator", label: "Operator" },
  { value: "admin", label: "Admin" },
];

export type UserFormValues = {
  email: string;
  name: string;
  role: UserRole;
  password: string;
};

type UserFormProps = {
  /** Absent when creating. The same fields either way, so the two cannot drift. */
  user?: AdminUser;
  pending: boolean;
  onSubmit: (values: UserFormValues) => void;
  onCancel: () => void;
};

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    {children}
    {hint ? (
      <span className="text-xs text-muted-foreground">{hint}</span>
    ) : null}
  </label>
);

export const UserForm = ({
  user,
  pending,
  onSubmit,
  onCancel,
}: UserFormProps) => {
  const editing = Boolean(user);
  const [email, setEmail] = useState(user?.email ?? "");
  const [name, setName] = useState(user?.name ?? "");
  const [role, setRole] = useState<UserRole>(user?.role ?? "user");
  const [password, setPassword] = useState("");

  const canSubmit =
    (editing || (email.trim() !== "" && password !== "")) && !pending;

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ email: email.trim(), name: name.trim(), role, password });
      }}
    >
      <Field
        label="Email"
        hint={editing ? "The email cannot be changed." : undefined}
      >
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={editing || pending}
          required={!editing}
          className="h-9"
        />
      </Field>

      <Field label="Name">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={pending}
          className="h-9"
        />
      </Field>

      <Field label="Role" hint={ROLE_HINTS[role]}>
        <Select
          value={role}
          onValueChange={(value: string | null) =>
            value && setRole(value as UserRole)
          }
          options={ROLE_OPTIONS}
          disabled={pending}
        />
      </Field>

      <Field
        label={editing ? "New password" : "Password"}
        hint={
          editing
            ? "Leave empty to keep the current one. At least 10 characters."
            : "At least 10 characters."
        }
      >
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={password ? 10 : undefined}
          required={!editing}
          disabled={pending}
          className="h-9"
        />
      </Field>

      <div className="mt-1 flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={!canSubmit}>
          {pending ? "Saving…" : editing ? "Save changes" : "Create account"}
        </Button>
      </div>
    </form>
  );
};
