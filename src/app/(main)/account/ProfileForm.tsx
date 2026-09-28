"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check } from "lucide-react";
import { Button } from "@/shared/UI/Button";
import { Input } from "@/shared/UI/Input";
import type { SessionUser } from "@/shared/lib/session-types";

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
    {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
  </label>
);

export const ProfileForm = ({ user }: { user: SessionUser }) => {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, currentPassword, newPassword }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Could not save your profile.");

      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save your profile.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium text-foreground">Your details</h2>

        <Field label="Email" hint="Your email cannot be changed.">
          <Input value={user.email} disabled className="h-9" />
        </Field>

        <Field label="Name">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={pending}
            className="h-9"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium text-foreground">Change password</h2>

        <Field label="Current password">
          <Input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
            disabled={pending}
            className="h-9"
          />
        </Field>

        <Field label="New password" hint="At least 10 characters.">
          <Input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            disabled={pending}
            className="h-9"
          />
        </Field>
      </section>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}

      {saved ? (
        <p className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
          <Check className="size-4 shrink-0" />
          Saved.
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
};
